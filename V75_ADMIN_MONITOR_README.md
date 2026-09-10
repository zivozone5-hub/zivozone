# ZIVOZONE V75 — Admin / Users / Players / Hosting Monitor

## الهدف
- عدّ الحسابات المسجلة والزيارات ودخول اليوم والألعاب.
- عرض آخر اللاعبين المسجلين وتقدمهم.
- إظهار حالة الموقع/HTTPS/Firebase/الأخبار.
- حماية لوحة الإدارة عبر Firebase custom claim: `admin: true`.
- لا تعرض هوية الضيف؛ الضيوف يدخلون في إحصاءات مجمعة فقط.

## مهم
GitHub Pages هو استضافة static. لا يمكن للواجهة وحدها معرفة كل زوار الموقع بشكل موثوق؛ V75 يستخدم Cloud Function + Firestore للإحصاءات، ويعرض حالة التطبيق وFirebase، وليس مراقبة بنية GitHub الداخلية.

## فتح لوحة الإدارة
بعد إعطاء حسابك claim باسم `admin=true` افتح:
`https://zivozone.com/#admin`

## نشر التغييرات
من مجلد المشروع:
`firebase deploy --only functions,firestore:rules`
ثم ارفع ملفات الموقع إلى GitHub.

## صلاحية admin
يجب تعيين custom claim على حساب المالك من بيئة موثوقة باستخدام Firebase Admin SDK. لا تضع كلمة سر الإدارة أو service account داخل الموقع.


## V75.1 — owner bootstrap
The monitor now includes a one-time `zivoBootstrapAdmin` callable. It only succeeds when the signed-in Firebase Auth account has the owner UID `rBlzUigQ6DhgD4CK6VX3tS43PS43` and email `raefalbtish@gmail.com`. It sets the server-side custom claim `admin: true`, refreshes the token, and keeps the `/admins/{uid}` Firestore record synchronized.

Deploy from the project root with:
`firebase deploy --only functions,firestore:rules,hosting`
Then sign in with `raefalbtish@gmail.com` and open `https://zivozone.com/#admin`.
