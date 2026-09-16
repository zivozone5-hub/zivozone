# ZIVOZONE V1164 — PLAYER HOME + MINING WALLET CORE

## الهدف
استبدال منطق التعدين داخل Player Home بنظام اقتصادي مترابط: كل عملية تعدين تضيف 0.50 ZIVO إلى محفظة التعدين الصغيرة. عند وصولها إلى السعة (5 ZIVO افتراضيًا) يتم تحويل كامل الرصيد تلقائيًا داخل نفس Firestore transaction إلى المحفظة الرئيسية ثم تصفير محفظة التعدين.

## الربط
Player Home ← Economy Core ← Firestore wallet/mining/miningWallet ← Ledger + Events

## السعة
5 ZIVO افتراضيًا عبر `MINING_WALLET_CAPACITY`.

## تنظيف الواجهة
تم حذف مدخل التعدين المكرر من شبكة وجهات Player Home؛ زر التعدين أصبح داخل بطاقة محفظة التعدين نفسها.

## الأمان
تم توسيع Firestore Rules للسماح فقط بتغييرات التعدين والتحويل المبرمجة، مع ربط زيادة المحفظة الرئيسية بإفراغ محفظة التعدين في نفس transaction.
