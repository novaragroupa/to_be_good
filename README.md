# خطوات التشغيل

## 1) الباك اند (Apps Script) - من الكمبيوتر
1. افتح script.google.com > New project.
2. امسح الكود اللي فيه وحط محتوى `Code.gs`.
3. من Project Settings (أيقونة الترس) > Script Properties > Add property:
   - الاسم: `PASSWORD`
   - القيمة: الباسورد اللي تختاره (طويل شوية، مش هيتكتب في أي مكان في الكود).
4. ارجع للمحرر، اختار الدالة `setup` من القايمة ودوس Run، ووافق على الصلاحيات. هيتعمل فولدر اسمه "Phone Rescue" في درايفك.
5. Deploy > New deployment > النوع Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. انسخ رابط الـ Web App (بينتهي بـ `/exec`).

## 2) الصفحة (GitHub Pages)
1. افتح `index.html` وغيّر السطر `APPS_SCRIPT_URL` وحط الرابط اللي نسخته.
2. اعمل ريبو جديد على GitHub، وارفع `index.html` فيه.
3. Settings > Pages > Branch: main > Save.
4. بعد دقيقة هتلاقي رابط الصفحة `https://USERNAME.github.io/REPO/`، ابعته لنفسك على الواتس.

## 3) من الموبايل
1. افتح الرابط، اكتب الباسورد، دوس "اختار ملفات" واختار اللي عاوزه، وبعدها "ابدأ الرفع".
2. الفيديوهات الكبيرة بتاخد وقت (حوالي ساعة لكل 1GB تقريبًا حسب النت). ابدأ بالأهم.
3. الملفات بتظهر في فولدر "Phone Rescue" على درايفك، نزّلها من الكمبيوتر.

## ملاحظات
- لو غيّرت كود الـ Apps Script بعد كده، لازم Deploy > Manage deployments > Edit > New version.
- بعد ما تخلص الرفع، امسح الـ deployment أو غيّر الباسورد.
- متحطش الباسورد في GitHub أبدًا.
