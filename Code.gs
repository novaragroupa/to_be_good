/**
 * Phone Rescue - Apps Script backend
 * بيستقبل ملفات من صفحة الويب على دفعات ويحفظها في فولدر على Google Drive.
 * الباسورد بيتخزن في Script Properties (مش في الكود).
 */

const UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/drive/v3/files';

// شغّل الدالة دي مرة واحدة من المحرر عشان تدي الصلاحيات وتتعمل الفولدر
function setup() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PASSWORD')) {
    throw new Error('ضيف Script Property اسمها PASSWORD (Project Settings > Script Properties) وبعدين شغّل setup تاني');
  }
  if (!props.getProperty('FOLDER_ID')) {
    const folder = DriveApp.createFolder('Phone Rescue');
    props.setProperty('FOLDER_ID', folder.getId());
  }
  // سطر بسيط بس عشان جوجل يطلب صلاحية الاتصال الخارجي
  UrlFetchApp.fetch('https://www.googleapis.com/discovery/v1/apis', { muteHttpExceptions: true });
  Logger.log('تمام. الفولدر: ' + DriveApp.getFolderById(props.getProperty('FOLDER_ID')).getUrl());
}

function doGet() {
  return json_({ ok: true, msg: 'Phone Rescue backend is running' });
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();

    if (!req.pw || req.pw !== props.getProperty('PASSWORD')) {
      Utilities.sleep(1500); // تبطيء محاولات التخمين
      return json_({ ok: false, error: 'bad_password' });
    }

    if (req.action === 'ping') return json_({ ok: true });
    if (req.action === 'start') return start_(req, props);
    if (req.action === 'chunk') return chunk_(req);
    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// بداية رفع ملف: بنفتح جلسة رفع على درايف ونرجّع رابطها للصفحة
function start_(req, props) {
  const folderId = props.getProperty('FOLDER_ID');
  if (!folderId) return json_({ ok: false, error: 'run_setup_first' });

  const name = String(req.name || 'file').replace(/[\\/]/g, '_');
  const mime = req.mime || 'application/octet-stream';
  const resp = UrlFetchApp.fetch(UPLOAD_ENDPOINT + '?uploadType=resumable', {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': mime,
      'X-Upload-Content-Length': String(req.size)
    },
    payload: JSON.stringify({ name: name, parents: [folderId] }),
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() !== 200) {
    return json_({ ok: false, error: 'start_failed ' + resp.getResponseCode() + ' ' + resp.getContentText().slice(0, 200) });
  }
  const headers = resp.getAllHeaders();
  let session = null;
  Object.keys(headers).forEach(function (k) {
    if (k.toLowerCase() === 'location') session = headers[k];
  });
  if (!session) return json_({ ok: false, error: 'no_session' });
  return json_({ ok: true, session: session });
}

// رفع جزء: الأجزاء لازم تكون مضاعفات 256KB ماعدا الأخير (الصفحة بتظبط ده)
function chunk_(req) {
  if (String(req.session).indexOf(UPLOAD_ENDPOINT) !== 0) {
    return json_({ ok: false, error: 'bad_session' });
  }
  const bytes = Utilities.base64Decode(req.data);
  const start = Number(req.start);
  const total = Number(req.total);
  const end = start + bytes.length - 1;

  const resp = UrlFetchApp.fetch(req.session, {
    method: 'put',
    contentType: 'application/octet-stream',
    headers: { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total },
    payload: bytes,
    muteHttpExceptions: true
  });

  const code = resp.getResponseCode();
  if (code === 308) return json_({ ok: true, done: false });
  if (code === 200 || code === 201) return json_({ ok: true, done: true });
  return json_({ ok: false, error: 'chunk_failed ' + code + ' ' + resp.getContentText().slice(0, 200) });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
