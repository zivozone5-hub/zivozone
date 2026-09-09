/* ============================================================
   ZIVOZONE CHALLENGE ENGINE V8
   - Unique pools per challenge
   - 10 questions/session
   - Mixed interaction types
   - Difficulty 1..10, last 3 are extreme
   - Five-language question data with safe fallback
============================================================ */
(() => {
  'use strict';
  const A=(ar,en,zh,hi,es)=>({ar,en,zh,hi,es});
  const Q=(id,type,q,answers,c,d,extra={})=>({id,type,q,a:answers,c,d,...extra});
  const O=(ar,en,zh= en,hi=en,es=en)=>A(ar,en,zh,hi,es);
  const bank={};

  bank.iq={id:'iq',icon:'🧠',xp:110,title:O('مختبر الذكاء','IQ Lab','智力实验室','IQ लैब','Laboratorio IQ'),desc:O('منطق وأنماط واستدلال، وآخر 3 أسئلة شديدة الصعوبة.','Logic, patterns and deduction; the final 3 are extreme.','逻辑、模式与推理；最后3题为极难。','तर्क, पैटर्न और निष्कर्ष; अंतिम 3 बेहद कठिन।','Lógica, patrones y deducción; las últimas 3 son extremas.'),questions:[
    Q('iq-01','choice',O('ما العدد التالي: 3، 6، 12، 24، ؟','What comes next: 3, 6, 12, 24, ?','下一个数字：3、6、12、24、？','अगली संख्या: 3, 6, 12, 24, ?','¿Qué sigue: 3, 6, 12, 24, ?'),[O('36','36'),O('42','42'),O('48','48'),O('54','54')],2,1),
    Q('iq-02','choice',O('إذا كان كل القطط ثدييات وبعض الثدييات سوداء، فما الذي نعرفه يقينًا؟','If all cats are mammals and some mammals are black, what is certain?','如果所有猫都是哺乳动物，而部分哺乳动物是黑色，什么一定成立？','यदि सभी बिल्लियाँ स्तनधारी हैं और कुछ स्तनधारी काले हैं, तो क्या निश्चित है?','Si todos los gatos son mamíferos y algunos mamíferos son negros, ¿qué es seguro?'),[O('كل القطط سوداء','All cats are black'),O('بعض القطط سوداء','Some cats are black'),O('كل القطط ثدييات','All cats are mammals'),O('لا توجد قطط سوداء','No cats are black')],2,2),
    Q('iq-03','number',O('أدخل العدد التالي: 2، 5، 11، 23، 47، ؟','Enter the next number: 2, 5, 11, 23, 47, ?','输入下一个数字：2、5、11、23、47、？','अगली संख्या दर्ज करें: 2, 5, 11, 23, 47, ?','Introduce el siguiente número: 2, 5, 11, 23, 47, ?'),[],95,3,{answer:'2n+1'}),
    Q('iq-04','choice',O('أي كلمة تكمل العلاقة: كتاب : قراءة :: طعام : ؟','Complete: Book : Reading :: Food : ?','完成类比：书：阅读 :: 食物：？','समानता पूरी करें: किताब : पढ़ना :: भोजन : ?','Completa: Libro : Lectura :: Comida : ?'),[O('طبخ','Cooking'),O('أكل','Eating'),O('شراء','Buying'),O('رمي','Throwing')],1,4),
    Q('iq-05','choice',O('لديك 5 صناديق. كل صندوق يحتوي ضعف ما قبله، والأول يحوي 3 كرات. كم في الخامس؟','Five boxes each contain twice the previous box. The first has 3 balls. How many are in the fifth?','五个盒子每个是前一个的两倍，第一个有3个球，第五个有多少？','पाँच डिब्बों में हर अगला पिछले का दोगुना है। पहले में 3 गेंदें हैं। पाँचवें में कितनी हैं?','Cinco cajas tienen el doble que la anterior. La primera tiene 3 bolas. ¿Cuántas hay en la quinta?'),[O('24','24'),O('36','36'),O('48','48'),O('60','60')],2,5),
    Q('iq-06','choice',O('إذا كان A=1 وB=2 ... فما مجموع ZIVO؟','If A=1, B=2... what is the sum of ZIVO?','若A=1、B=2……ZIVO的总和是多少？','यदि A=1, B=2... तो ZIVO का योग कितना है?','Si A=1, B=2... ¿cuál es la suma de ZIVO?'),[O('62','62'),O('64','64'),O('66','66'),O('68','68')],1,6),
    Q('iq-07','choice',O('ثلاثة أشخاص يقولون: علي أطول من سامر، سامر أطول من ليث. من الأقصر؟','Ali is taller than Samer, and Samer is taller than Laith. Who is shortest?','阿里比萨默尔高，萨默尔比莱思高。谁最矮？','अली समीर से लंबा है और समीर लैथ से लंबा है। सबसे छोटा कौन?','Ali es más alto que Samer y Samer que Laith. ¿Quién es el más bajo?'),[O('علي','Ali'),O('سامر','Samer'),O('ليث','Laith'),O('لا يمكن معرفة ذلك','Cannot know')],2,7),
    Q('iq-08','number',O('أدخل العدد: 1، 1، 2، 3، 5، 8، ؟','Enter the next number: 1, 1, 2, 3, 5, 8, ?','输入下一个数字：1、1、2、3、5、8、？','अगली संख्या दर्ज करें: 1, 1, 2, 3, 5, 8, ?','Introduce el siguiente número: 1, 1, 2, 3, 5, 8, ?'),[],13,8,{answer:'13'}),
    Q('iq-09','choice',O('إذا كان لديك 12 عملة، واحدة مزيفة أثقل، وبميزان كفتين و3 وزنات فقط، ما الحد الأقصى لعدد العملات التي يمكنك تمييزها؟','With 12 coins, one counterfeit heavier, a balance scale and only 3 weighings, how many coins can be guaranteed distinguishable?','12枚硬币中一枚更重的假币，用天平称3次，最多可保证识别多少枚？','12 सिक्कों में एक भारी नकली है; तराजू और केवल 3 तौल में अधिकतम कितने सिक्कों को निश्चित रूप से पहचान सकते हैं?','Con 12 monedas y una falsa más pesada, ¿cuántas puedes distinguir con certeza usando 3 pesadas?'),[O('6','6'),O('9','9'),O('12','12'),O('18','18')],2,9),
    Q('iq-10','choice',O('لغز صعب: لديك 100 سجين ومفتاح واحد ومصباح، ويمكن لكل سجين دخول الغرفة مرة واحدة. ما الفكرة القياسية التي تضمن معرفة أن الجميع دخلوا؟','Hard puzzle: 100 prisoners, one key and one lamp; each prisoner enters once. What standard strategy guarantees knowing everyone has entered?','难题：100名囚犯、一个钥匙和一盏灯，每人只进一次。什么标准策略能保证知道所有人都进入过？','कठिन पहेली: 100 कैदी, एक चाबी और एक लैंप; हर कैदी एक बार कमरे में जाता है। कौन सी मानक रणनीति सुनिश्चित करती है कि सभी अंदर आ चुके हैं?','Acertijo difícil: 100 presos, una llave y una lámpara; cada preso entra una vez. ¿Qué estrategia estándar garantiza saber que todos entraron?'),[O('عدّاد عشوائي','Random counter'),O('سجين قائد يعد إشارات المصباح','A designated counter counts lamp signals'),O('إطفاء المصباح دائمًا','Always keep it off'),O('لا توجد طريقة','There is no way')],1,10)
  ]};

  bank.science={id:'science',icon:'🔬',xp:100,title:O('مختبر العلوم','Science Lab','科学实验室','विज्ञान लैब','Laboratorio de ciencia'),desc:O('علوم متنوعة مع أسئلة تطبيقية لا تعتمد على الحفظ فقط.','Mixed science with applied questions, not pure memorization.','综合科学与应用题，而非单纯记忆。','विविध विज्ञान और अनुप्रयोग आधारित प्रश्न।','Ciencia variada con preguntas aplicadas.'),questions:[
    Q('sc-01','choice',O('ما الكوكب المعروف بالكوكب الأحمر؟','Which planet is known as the Red Planet?','哪颗行星被称为红色星球？','किस ग्रह को लाल ग्रह कहा जाता है?','¿Qué planeta es el Planeta Rojo?'),[O('المريخ','Mars'),O('الزهرة','Venus'),O('المشتري','Jupiter'),O('عطارد','Mercury')],0,1),
    Q('sc-02','choice',O('أي وحدة تقيس القوة؟','Which unit measures force?','哪种单位测量力？','बल की इकाई क्या है?','¿Qué unidad mide la fuerza?'),[O('جول','Joule'),O('نيوتن','Newton'),O('واط','Watt'),O('فولت','Volt')],1,2),
    Q('sc-03','choice',O('إذا تضاعفت سرعة جسم، فكيف تتغير طاقته الحركية؟','If an object’s speed doubles, how does kinetic energy change?','物体速度加倍，动能如何变化？','यदि किसी वस्तु की गति दोगुनी हो जाए तो गतिज ऊर्जा कैसे बदलेगी?','Si la velocidad se duplica, ¿cómo cambia la energía cinética?'),[O('تتضاعف','Doubles'),O('تصبح 3 أضعاف','Triples'),O('تصبح 4 أضعاف','Becomes four times'),O('لا تتغير','Unchanged')],2,4),
    Q('sc-04','number',O('كم ثانية في 3.5 دقائق؟','How many seconds are in 3.5 minutes?','3.5分钟有多少秒？','3.5 मिनट में कितने सेकंड होते हैं?','¿Cuántos segundos hay en 3,5 minutos?'),[],210,4,{answer:'210'}),
    Q('sc-05','choice',O('أي عملية تحول الطاقة الضوئية إلى طاقة كيميائية في النبات؟','Which process converts light energy into chemical energy in plants?','植物把光能转为化学能的过程是什么？','पौधों में प्रकाश ऊर्जा को रासायनिक ऊर्जा में बदलने की प्रक्रिया क्या है?','¿Qué proceso convierte la luz en energía química en las plantas?'),[O('التنفس','Respiration'),O('البناء الضوئي','Photosynthesis'),O('التخمر','Fermentation'),O('الانتشار','Diffusion')],1,5),
    Q('sc-06','choice',O('لماذا يبدو القمر مضيئًا؟','Why does the Moon appear bright?','为什么月亮看起来发亮？','चंद्रमा चमकीला क्यों दिखाई देता है?','¿Por qué la Luna parece brillante?'),[O('ينتج ضوءه الخاص','It produces its own light'),O('يعكس ضوء الشمس','It reflects sunlight'),O('يمتص الضوء','It absorbs light'),O('لأنه ساخن مثل الشمس','It is as hot as the Sun')],1,6),
    Q('sc-07','number',O('إذا كان نصف العمر لمادة 8 ساعات، فما النسبة المتبقية بعد 24 ساعة؟ اكتبها كنسبة مئوية.','If a substance has an 8-hour half-life, what percentage remains after 24 hours? Enter a percent.','某物质半衰期为8小时，24小时后剩余百分比是多少？','यदि किसी पदार्थ का अर्ध-आयु 8 घंटे है, 24 घंटे बाद कितना प्रतिशत बचेगा?','Si la vida media es de 8 horas, ¿qué porcentaje queda tras 24 horas?'),[],12.5,8,{answer:'12.5'}),
    Q('sc-08','choice',O('في دائرة كهربائية على التوالي، إذا انقطع أحد المصابيح، ماذا يحدث عادةً؟','In a series circuit, if one lamp breaks, what usually happens?','串联电路中一个灯泡断路通常会怎样？','श्रृंखला परिपथ में एक बल्ब टूट जाए तो सामान्यतः क्या होता है?','En un circuito en serie, si una lámpara se rompe, ¿qué suele pasar?'),[O('البقية تبقى تعمل طبيعيًا','The rest work normally'),O('تنطفئ الدائرة كلها','The whole circuit goes off'),O('تزداد الإضاءة دائمًا','Brightness always increases'),O('لا شيء','Nothing')],1,8),
    Q('sc-09','choice',O('أي مبدأ يفسر أن الضغط يقل عندما تزداد سرعة السائل في جريان مستقر؟','Which principle explains lower pressure at higher fluid speed in steady flow?','稳定流动中速度越高压力越低由什么原理解释？','स्थिर प्रवाह में गति बढ़ने पर दबाव घटने का सिद्धांत क्या है?','¿Qué principio explica que la presión baje al aumentar la velocidad de un fluido?'),[O('أرخميدس','Archimedes'),O('برنولي','Bernoulli'),O('نيوتن الأول','Newton I'),O('كولوم','Coulomb')],1,9),
    Q('sc-10','choice',O('في نظام مغلق، إذا زادت الإنتروبي بشكل طبيعي، أي اتجاه للعمليات هو الأكثر توافقًا مع القانون الثاني للديناميكا الحرارية؟','In a closed system, increasing entropy naturally corresponds to which direction?','封闭系统中熵自然增加对应哪种过程方向？','बंद तंत्र में एंट्रॉपी का स्वाभाविक बढ़ना किस दिशा से मेल खाता है?','En un sistema cerrado, el aumento natural de entropía corresponde a qué dirección?'),[O('نحو حالات أقل احتمالًا','Toward less probable states'),O('نحو حالات أكثر عشوائية/احتمالًا','Toward more probable, more dispersed states'),O('نحو طاقة صفرية','Toward zero energy'),O('نحو سرعة الضوء','Toward light speed')],1,10)
  ]};

  bank.daily={id:'daily',icon:'⚡',xp:70,title:O('تحدي ZIVO اليومي','ZIVO Daily','ZIVO 每日挑战','ZIVO दैनिक','Desafío diario ZIVO'),desc:O('جلسة سريعة تتغير كل يوم وتمنع التكرار قدر الإمكان.','A fast session that rotates questions and minimizes repeats.','每日轮换并尽量避免重复。','तेज़ दैनिक सत्र और न्यूनतम दोहराव।','Sesión rápida con rotación y mínimos repetidos.'),questions:[
    Q('dy-01','number',O('كم يساوي 17 × 6؟','What is 17 × 6?','17 × 6 等于多少？','17 × 6 कितना है?','¿Cuánto es 17 × 6?'),[],102,1,{answer:'102'}),
    Q('dy-02','choice',O('أي دولة عربية تقع فيها مدينة العقبة؟','Aqaba is in which Arab country?','亚喀巴位于哪个阿拉伯国家？','अकाबा किस अरब देश में है?','¿En qué país árabe está Aqaba?'),[O('الأردن','Jordan'),O('مصر','Egypt'),O('تونس','Tunisia'),O('عُمان','Oman')],0,1),
    Q('dy-03','choice',O('إذا كان لديك 24 ثم طرحت 9 ثم أضفت 7، ما الناتج؟','Start with 24, subtract 9, then add 7. Result?','24减9再加7是多少？','24 में से 9 घटाकर 7 जोड़ें। परिणाम?','Empieza con 24, resta 9 y suma 7. ¿Resultado?'),[O('20','20'),O('21','21'),O('22','22'),O('23','23')],2,2),
    Q('dy-04','input',O('اكتب أول حرف من كلمة ZIVO بالعربية كما تنطقها: ز','Type the first Arabic letter of ZIVO as pronounced: ز','输入ZIVO第一个音的阿拉伯字母：ز','ZIVO के पहले उच्चरित अरबी अक्षर को लिखें: ز','Escribe la primera letra árabe del sonido de ZIVO: ز'),[],0,3,{answer:['ز','z']}),
    Q('dy-05','choice',O('ما العدد الذي يقبل القسمة على 3 و4 معًا؟','Which number is divisible by both 3 and 4?','哪个数字同时能被3和4整除？','कौन सी संख्या 3 और 4 दोनों से विभाजित होती है?','¿Qué número es divisible por 3 y 4?'),[O('10','10'),O('12','12'),O('14','14'),O('18','18')],1,4),
    Q('dy-06','number',O('إذا كان محيط مربع 36، فما طول الضلع؟','A square has perimeter 36. What is the side length?','正方形周长36，边长是多少？','वर्ग का परिमाप 36 है। भुजा कितनी है?','Un cuadrado tiene perímetro 36. ¿Cuánto mide el lado?'),[],9,5,{answer:'9'}),
    Q('dy-07','choice',O('أي نمط يأتي بعد: A, C, F, J, ؟','What comes next: A, C, F, J, ?','下一个字母：A、C、F、J、？','अगला अक्षर: A, C, F, J, ?','¿Qué sigue: A, C, F, J, ?'),[O('M','M'),O('N','N'),O('O','O'),O('P','P')],2,7),
    Q('dy-08','choice',O('إذا كان 40% من عدد ما يساوي 28، فما العدد؟','If 40% of a number is 28, what is the number?','一个数的40%等于28，该数是多少？','किसी संख्या का 40% 28 है, संख्या क्या है?','Si el 40% de un número es 28, ¿cuál es el número?'),[O('56','56'),O('60','60'),O('70','70'),O('84','84')],2,8),
    Q('dy-09','choice',O('لديك 3 مفاتيح خارج غرفة و3 مصابيح داخلها. يمكنك دخول الغرفة مرة واحدة. ما أفضل فكرة؟','Three switches outside control three bulbs inside; enter once. Best idea?','外面三个开关控制里面三个灯，只能进房一次。最佳思路？','तीन स्विच बाहर और तीन बल्ब अंदर हैं，只能进入一次。最佳 विचार?','Tres interruptores controlan tres bombillas y solo puedes entrar una vez. ¿Mejor idea?'),[O('التخمين','Guess'),O('استخدام الحرارة مع الضوء','Use light plus bulb heat'),O('كسر الباب','Break the door'),O('لا يمكن','Impossible')],1,9),
    Q('dy-10','choice',O('إذا كان كل رقم في سلسلة يساوي مجموع الرقمين السابقين ناقص 1، وبدأنا 3،4، فما الرقم الرابع؟','Each term equals the sum of the previous two minus 1. Starting 3,4, what is the fourth term?','每项等于前两项之和减1，从3、4开始，第4项是多少？','हर पद पिछले दो का योग माइनस 1 है। 3,4 से शुरू करें, चौथा पद?','Cada término es la suma de los dos anteriores menos 1. Empezando 3,4, ¿cuál es el cuarto?'),[O('8','8'),O('9','9'),O('10','10'),O('11','11')],1,10)
  ]};

  bank.football={id:'football',icon:'⚽',xp:110,title:O('مختبر كرة القدم','Football Lab','足球实验室','फुटबॉल लैब','Laboratorio de fútbol'),desc:O('أسئلة كروية من المعرفة إلى القرار التكتيكي.','From football knowledge to tactical decision-making.','从足球知识到战术决策。','फुटबॉल ज्ञान से सामरिक निर्णय तक।','Del conocimiento futbolístico a la decisión táctica.'),questions:[
    Q('fb-01','choice',O('كم لاعبًا يبدأ به الفريق في الملعب؟','How many players start on the field for one team?','一支球队场上开始时有多少球员？','एक टीम के कितने खिलाड़ी मैदान पर शुरू करते हैं?','¿Cuántos jugadores inicia un equipo en el campo?'),[O('9','9'),O('10','10'),O('11','11'),O('12','12')],2,1),
    Q('fb-02','choice',O('متى يُحتسب الهدف؟','When is a goal awarded?','何时算进球？','गोल कब माना जाता है?','¿Cuándo se concede un gol?'),[O('عندما تتجاوز الكرة خط المرمى بالكامل وفق القواعد','When the ball wholly crosses the goal line under the Laws'),O('عندما تلمس القائم','When it touches the post'),O('عندما يطلب الجمهور','When fans ask'),O('عند أي تسديدة','On any shot')],0,2),
    Q('fb-03','choice',O('أنت متقدم 1-0، الدقائق الأخيرة والخصم يضغط. ما الخيار الأقل مخاطرة؟','You lead 1-0 late while the opponent presses. Which option is generally lower risk?','你1-0领先且对手末段施压，哪种选择通常风险更低？','आप 1-0 आगे हैं और अंत में विपक्ष दबाव डाल रहा है। सामान्यतः कम जोखिम वाला विकल्प?','Vas ganando 1-0 y el rival presiona al final. ¿Qué opción suele tener menor riesgo?'),[O('فتح الخطوط بالكامل','Open all lines'),O('الحفاظ على التماسك وتقليل المساحات','Keep compactness and reduce spaces'),O('إرسال كل المدافعين للهجوم','Send all defenders forward'),O('التوقف عن اللعب','Stop playing')],1,4),
    Q('fb-04','choice',O('ما الهدف الرئيسي من الضغط العكسي مباشرة بعد فقدان الكرة؟','Main aim of counter-pressing immediately after losing the ball?','丢球后立即反抢的主要目标？','गेंद खोने के तुरंत बाद काउंटर-प्रेसिंग का मुख्य उद्देश्य?','¿Objetivo principal de la presión tras pérdida?'),[O('استرجاع الكرة أو منع التمريرة الأولى','Win it back or disrupt the first pass'),O('العودة للمرمى فورًا دائمًا','Always retreat immediately'),O('إضاعة الوقت','Waste time'),O('تغيير الحارس','Change the goalkeeper')],0,5),
    Q('fb-05','number',O('فريق سجل 18 هدفًا في 6 مباريات. ما متوسطه في المباراة؟','A team scores 18 goals in 6 matches. Average per match?','一队6场进18球，场均多少？','एक टीम ने 6 मैचों में 18 गोल किए। प्रति मैच औसत?','Un equipo marca 18 goles en 6 partidos. ¿Promedio por partido?'),[],3,5,{answer:'3'}),
    Q('fb-06','choice',O('إذا كان الظهير يتقدم باستمرار، ما الحركة التي تساعد على خلق توازن؟','If a full-back constantly advances, what movement can help maintain balance?','边后卫不断前插，什么跑动有助于保持平衡？','यदि फुल-बैक लगातार आगे बढ़ता है, कौन सी मूवमेंट संतुलन बनाए रख सकती है?','Si el lateral sube constantemente, ¿qué movimiento ayuda a mantener el equilibrio?'),[O('تقدم الجناح نفسه في الخط نفسه دائمًا','Winger always stays on the same line'),O('تغطية الجناح أو لاعب الوسط للمساحة','Winger/midfielder covers the space'),O('إخراج الحارس','Remove the goalkeeper'),O('إيقاف الهجوم','Stop attacking')],1,6),
    Q('fb-07','choice',O('فريق يواجه كتلة منخفضة جدًا. ما الذي يزيد فرص الاختراق؟','Against a very low block, what generally increases penetration chances?','面对低位防守，什么通常增加渗透机会？','बहुत गहरी लो ब्लॉक के खिलाफ क्या आमतौर पर पैठ बढ़ाता है?','Contra un bloque bajo, ¿qué suele aumentar las opciones de penetración?'),[O('تدوير الكرة بسرعة مع تغيير جهة اللعب','Fast circulation and switching sides'),O('تمريرات عرضية عشوائية فقط','Random crosses only'),O('إبطاء كل قرار','Slow every decision'),O('إلغاء التحرك بدون كرة','Remove off-ball movement')],0,7),
    Q('fb-08','choice',O('في 4-3-3، إذا أصبح الجناح عريضًا جدًا، ماذا يمكن أن يفتح؟','In a 4-3-3, what can an extremely wide winger help open?','4-3-3中边锋站得很宽可以打开什么？','4-3-3 में बहुत चौड़ा विंगर क्या खोल सकता है?','En 4-3-3, ¿qué puede abrir un extremo muy abierto?'),[O('الممر الداخلي لنصف المساحة','The inside half-space'),O('مقاعد البدلاء','The bench'),O('غرفة الملابس','The dressing room'),O('لا شيء','Nothing')],0,8),
    Q('fb-09','choice',O('أمام ضغط رجل لرجل، ما الحل التكتيكي الأكثر منطقية عادة؟','Against man-oriented pressing, which tactical solution is often logical?','面对人盯人式压迫，通常合理的战术解决方案？','मैन-ओरिएंटेड प्रेसिंग के खिलाफ सामान्यतः कौन सा समाधान तर्कसंगत है?','Ante una presión orientada al hombre, ¿qué solución suele ser lógica?'),[O('خلق لاعب ثالث وتحريك الخصم','Create a third-man option and move the marker'),O('الثبات في نفس المكان','Stay static'),O('إيقاف التمرير','Stop passing'),O('اللعب بلا عرض','Play with no width')],0,9),
    Q('fb-10','choice',O('في الدقيقة 88 والنتيجة 2-2، فريقك لديه استحواذ آمن لكن الخصم متقدم في عدد اللاعبين أمام الكرة. ما القرار الأكثر نضجًا؟','At 88’ with 2-2, you have safe possession but the opponent has many players ahead of the ball. Most mature choice?','88分钟2-2，你安全控球但对手有很多人压在球前，最成熟的选择？','88वें मिनट में 2-2, आपके पास सुरक्षित कब्जा लेकिन विपक्ष गेंद के आगे人数多。最成熟的决定?','En el 88’ con 2-2, tienes posesión segura pero el rival tiene muchos jugadores por delante del balón. ¿Decisión más madura?'),[O('مخاطرة عمياء في العمق','Blind risk into the centre'),O('إدارة المخاطر مع اختيار لحظة الهجوم','Manage risk and choose the right attacking moment'),O('إرجاع الكرة للحارس دائمًا','Always pass to the keeper'),O('إخراج الكرة من الملعب','Kick it out')],1,10)
  ]};

  bank.logic={id:'logic',icon:'♟️',xp:120,title:O('غرفة المنطق','Logic Room','逻辑房间','लॉजिक रूम','Sala de lógica'),desc:O('استنتاجات وألغاز لا تعتمد على الحفظ.','Deduction and puzzles, not memorization.','推理与谜题，而非记忆。','निष्कर्ष और पहेलियाँ, याददाश्त नहीं।','Deducción y acertijos, no memoria.'),questions:[
    Q('lg-01','choice',O('إذا كانت جميع المربعات مستطيلات، هل كل مستطيل مربع؟','If all squares are rectangles, are all rectangles squares?','如果所有正方形都是矩形，所有矩形都是正方形吗？','यदि सभी वर्ग आयत हैं, क्या सभी आयत वर्ग हैं?','Si todos los cuadrados son rectángulos, ¿todos los rectángulos son cuadrados?'),[O('نعم','Yes'),O('لا','No'),O('فقط أحيانًا','Only sometimes'),O('لا يمكن معرفة ذلك','Cannot know')],1,2),
    Q('lg-02','number',O('إذا كان X + X + 6 = 20، فما X؟','If X + X + 6 = 20, what is X?','若X+X+6=20，X是多少？','यदि X + X + 6 = 20, X क्या है?','Si X + X + 6 = 20, ¿X?'),[],7,2,{answer:'7'}),
    Q('lg-03','choice',O('رجل ينظر إلى صورة ويقول: ليس لي أخ أو أخت، لكن والد هذا الرجل هو ابن أبي. من في الصورة؟','A man says: I have no siblings, but the father of the person in the photo is my father’s son. Who is in the photo?','一个男人说：我没有兄弟姐妹，但照片里人的父亲是我父亲的儿子。照片里是谁？','एक आदमी कहता है: मेरा कोई भाई-बहन नहीं, लेकिन तस्वीर वाले व्यक्ति का पिता मेरे पिता का बेटा है। तस्वीर में कौन है?','Un hombre dice: no tengo hermanos, pero el padre de la persona de la foto es el hijo de mi padre. ¿Quién está en la foto?'),[O('والده','His father'),O('ابنه','His son'),O('عمه','His uncle'),O('صديقه','His friend')],1,4),
    Q('lg-04','choice',O('أربعة أشخاص يعبرون جسرًا ليلًا بمصباح واحد، أزمنتهم 1 و2 و7 و10 دقائق، ويعبر اثنان كحد أقصى. أقل زمن؟','Four people cross a bridge at night with one lamp; times 1,2,7,10 minutes, max two at once. Minimum total time?','四人过桥时间1、2、7、10分钟，一盏灯最多两人，最短总时间？','चार लोग 1,2,7,10 मिनट में पुल पार करते हैं，一灯，每次最多两人。最短 समय?','Cuatro personas tardan 1,2,7,10 min; una linterna, máximo dos. ¿Tiempo mínimo?'),[O('17','17'),O('19','19'),O('21','21'),O('23','23')],1,6),
    Q('lg-05','input',O('اكتب عدد الحروف في كلمة “منطق”','Enter the number of letters in the Arabic word “منطق”.','输入阿拉伯词“منطق”的字母数。','अरबी शब्द “منطق” में अक्षरों की संख्या लिखें।','Escribe el número de letras de la palabra árabe “منطق”.'),[],4,5,{answer:'4'}),
    Q('lg-06','choice',O('إذا كانت قاعدة الصندوق: كل ما يدخل يُخرج معكوسه. أدخل 123 ثم أعد الناتج مرة أخرى، ماذا يعود؟','A box reverses every input. Enter 123 then feed the output back once. What returns?','一个盒子把输入倒序。输入123，再把输出输入一次，得到什么？','एक बॉक्स हर इनपुट को उलटता है। 123 डालें और आउटपुट फिर डालें, क्या मिलेगा?','Una caja invierte cada entrada. Entra 123 y vuelve a introducir la salida. ¿Qué obtienes?'),[O('123','123'),O('321','321'),O('111','111'),O('213','213')],0,7),
    Q('lg-07','choice',O('تسلسل: 2، 3، 5، 9، 17، ؟ القاعدة تضاعف الفرق ثم تضيف 1. التالي؟','Sequence 2,3,5,9,17. The difference doubles then +1. Next?','序列2、3、5、9、17，差值翻倍再加1。下一项？','क्रम 2,3,5,9,17; अंतर दोगुना फिर +1। अगला?','Secuencia 2,3,5,9,17; la diferencia se duplica y luego +1. ¿Siguiente?'),[O('29','29'),O('31','31'),O('33','33'),O('35','35')],1,8),
    Q('lg-08','choice',O('لغز الصادق والكاذب: شخصان، أحدهما يكذب دائمًا والآخر يصدق دائمًا. A يقول: B كاذب. ماذا تستطيع استنتاجه؟','Truth/liar puzzle: A says “B is a liar.” What can you infer?','真假话者：A说“B是骗子”。你能推断什么？','सच्चा/झूठा पहेली: A कहता है “B झूठा है।” क्या निष्कर्ष?','Dos personas: una siempre miente y otra siempre dice la verdad. A dice “B miente”. ¿Qué deduces?'),[O('A كاذب وB صادق','A lies, B tells truth'),O('A صادق وB كاذب','A tells truth, B lies'),O('كلاهما كاذبان','Both lie'),O('لا يمكن أن نعرف','Cannot know')],1,9),
    Q('lg-09','choice',O('إذا كانت 5 آلات تصنع 5 قطع في 5 دقائق بنفس المعدل، كم آلة لصنع 100 قطعة في 100 دقيقة؟','If 5 machines make 5 items in 5 minutes at the same rate, how many machines make 100 items in 100 minutes?','5台机器5分钟做5件，100分钟做100件需要多少台？','5 मशीनें 5 मिनट में 5 वस्तुएँ बनाती हैं। 100 मिनट में 100 वस्तुओं के लिए कितनी मशीनें?','Si 5 máquinas hacen 5 piezas en 5 minutos, ¿cuántas para 100 piezas en 100 minutos?'),[O('1','1'),O('5','5'),O('10','10'),O('20','20')],0,9),
    Q('lg-10','choice',O('أصعب: لديك 8 كرات متطابقة وواحدة أثقل، ميزان كفتين ووزنتان فقط. كيف تضمن تحديدها؟','Hard: 8 identical balls, one heavier, two weighings. How guarantee finding it?','难题：8个相同球一个更重，两次天平称量，如何保证找到？','कठिन: 8 समान गेंदें, एक भारी, केवल दो तौल। कैसे सुनिश्चित करें?','Difícil: 8 bolas idénticas, una más pesada y dos pesadas. ¿Cómo garantizar encontrarla?'),[O('3-3-2 ثم 1-1','3-3-2 then 1-1'),O('4-4 ثم 2-2','4-4 then 2-2'),O('2-2-2-2 ثم تخمين','2-2-2-2 then guess'),O('لا يمكن','Impossible')],0,10)
  ]};

  bank.horror={id:'horror',icon:'👁️',xp:180,special:true,title:O('الغرفة المظلمة','The Dark Room','黑暗房间','डार्क रूम','La Habitación Oscura'),desc:O('تجربة نفسية متصاعدة بلا إجابات صحيحة أو خاطئة. بعد كل 10 أسئلة يتغير الإيقاع.','An escalating psychological experience with no right/wrong feedback. The rhythm changes every 10 questions.','不断升级的心理体验，不显示对错，每10题改变节奏。','बढ़ता हुआ मनोवैज्ञानिक अनुभव, सही/गलत नहीं बताया जाता। हर 10 सवाल में माहौल बदलता है।','Experiencia psicológica creciente sin mostrar aciertos o fallos. El ritmo cambia cada 10 preguntas.'),questions:[
    Q('hr-01','choice',O('لو وجدت بابًا لا تتذكر أنك فتحته، هل تدخل أم تراقبه أولًا؟','If you find a door you do not remember opening, do you enter or watch it first?','如果你发现一扇你不记得打开过的门，你会进去还是先观察？','यदि आपको ऐसा दरवाज़ा मिले जिसे खोलना याद नहीं, क्या आप अंदर जाएंगे या पहले देखेंगे?','Si encuentras una puerta que no recuerdas haber abierto, ¿entras o la observas primero?'),[O('أدخل','Enter'),O('أراقب','Watch'),O('أغلقه','Close it'),O('أطلب المساعدة','Ask for help')],0,1),
    Q('hr-02','choice',O('أيهما يزعجك أكثر: صوت خلفك أم صمت مفاجئ؟','Which is more unsettling: a sound behind you or sudden silence?','哪个更令人不安：身后的声音还是突然的寂静？','क्या अधिक परेशान करता है: पीछे की आवाज़ या अचानक सन्नाटा?','¿Qué inquieta más: un sonido detrás o un silencio repentino?'),[O('الصوت','The sound'),O('الصمت','The silence'),O('كلاهما','Both'),O('لا شيء','Neither')],1,2),
    Q('hr-03','choice',O('إذا سمعت اسمك من غرفة فارغة، ماذا تفعل؟','If you hear your name from an empty room, what do you do?','如果你从空房间听到自己的名字，你会怎么做？','यदि खाली कमरे से अपना नाम सुनें, क्या करेंगे?','Si oyes tu nombre desde una habitación vacía, ¿qué haces?'),[O('أدخل فورًا','Enter immediately'),O('أستمع أولًا','Listen first'),O('أهرب','Run'),O('أتجاهله','Ignore it')],1,3),
    Q('hr-04','choice',O('أمامك ثلاثة أزرار: أحمر، أبيض، أسود. أي واحد تختار دون معرفة وظيفته؟','Three buttons: red, white, black. Which do you press without knowing their function?','三个按钮：红、白、黑。不知道功能你按哪个？','तीन बटन: लाल, सफेद, काला। कार्य जाने बिना कौन दबाएँगे?','Tres botones: rojo, blanco, negro. ¿Cuál pulsas sin saber su función?'),[O('الأحمر','Red'),O('الأبيض','White'),O('الأسود','Black'),O('لا أضغط','None')],3,4),
    Q('hr-05','input',O('اكتب أول شيء يخطر ببالك عند كلمة: مراقبة','Type the first thing that comes to mind when you read: watched.','看到“被注视”时，你第一个想到什么？','“देखे जाने” पर सबसे पहले क्या सोचते हैं？','Escribe lo primero que te viene a la mente al leer: observado.'),[],0,5,{answer:'*'}),
    Q('hr-06','choice',O('إذا تكرر صوت خطواتك بنصف ثانية بعد كل خطوة، هل تغير سرعتك؟','If your footsteps repeat half a second later, do you change your pace?','如果你的脚步声每次晚半秒重复，你会改变速度吗？','यदि आपके कदमों की आवाज़ हर बार आधे सेकंड बाद दोहरती है, क्या आप गति बदलेंगे?','Si tus pasos se repiten medio segundo después, ¿cambias el ritmo?'),[O('نعم','Yes'),O('لا','No'),O('أجرب تغييرها','I test a change'),O('أتوقف','I stop')],2,6),
    Q('hr-07','choice',O('أي مكان تفضّل أن تكون فيه الآن؟','Where would you rather be right now?','你现在更愿意在哪里？','आप अभी कहाँ रहना पसंद करेंगे?','¿Dónde preferirías estar ahora?'),[O('مكان مضاء','A lit place'),O('مكان مألوف','A familiar place'),O('مع شخص آخر','With someone else'),O('لا يهم','Does not matter')],0,7),
    Q('hr-08','choice',O('إذا تغيّر ترتيب الخيارات دون أن تلمس الشاشة، هل تكمل؟','If the options rearrange without you touching the screen, do you continue?','如果选项在你没触碰屏幕时重新排列，你会继续吗？','यदि विकल्प बिना छुए बदल जाएँ, क्या आप जारी रखेंगे?','Si las opciones se reordenan sin tocar la pantalla, ¿sigues?'),[O('أكمل','Continue'),O('أتوقف','Stop'),O('أعيد تحميل الصفحة','Reload'),O('أخرج','Exit')],0,8),
    Q('hr-09','choice',O('أيهما أكثر إزعاجًا: أن تسمع اسمك، أم أن ترى اسمك مكتوبًا؟','Which is more unsettling: hearing your name or seeing it written?','哪种更不安：听到自己的名字还是看到名字被写下？','क्या अधिक परेशान करता है: अपना नाम सुनना या लिखा हुआ देखना?','¿Qué inquieta más: oír tu nombre o verlo escrito?'),[O('سماعه','Hearing it'),O('رؤيته','Seeing it'),O('كلاهما','Both'),O('لا شيء','Neither')],1,9),
    Q('hr-10','choice',O('إذا قال لك النظام: “السؤال التالي ليس لك”، هل تفتح السؤال؟','If the system says “the next question is not for you,” do you open it?','如果系统说“下一题不是给你的”，你会打开吗？','यदि सिस्टम कहे “अगला सवाल आपके लिए नहीं है”, क्या खोलेंगे?','Si el sistema dice “la siguiente pregunta no es para ti”, ¿la abres?'),[O('نعم','Yes'),O('لا','No'),O('بعد التفكير','After thinking'),O('أغلق اللعبة','Close the game')],0,10)
  ]};


  const horrorExtra=[
    ['hr-11','choice','إذا سمعت نفس النغمة كلما انتقلت إلى سؤال جديد، هل تعتبرها صدفة؟','If the same tone appears on every new question, do you treat it as coincidence?',['صدفة|Coincidence','إشارة|A signal','خطأ|An error','لا أعرف|I do not know'],1,4],
    ['hr-12','choice','إذا أصبح الضوء أضعف قليلًا، هل تلاحظ ذلك؟','If the light becomes slightly dimmer, do you notice it?',['نعم|Yes','لا|No','بعد فترة|Later','لا يهم|Does not matter'],0,5],
    ['hr-13','choice','هل تفضل أن تعرف ما وراء الباب أم أن يبقى مجهولًا؟','Would you rather know what is behind the door or keep it unknown?',['أعرف|Know','يبقى مجهولًا|Keep it unknown','لا أدخل|Do not enter','أغادر|Leave'],0,5],
    ['hr-14','choice','إذا تغيّر اسم اللعبة للحظة ثم عاد، هل تكمل؟','If the game title changes for a moment and returns, do you continue?',['أكمل|Continue','أتوقف|Stop','أعيد التحميل|Reload','أخرج|Exit'],0,6],
    ['hr-15','choice','أيهما أقوى في خيالك: ما تراه أم ما لا تستطيع رؤيته؟','Which is stronger in your imagination: what you see or what you cannot see?',['ما أراه|What I see','ما لا أراه|What I cannot see','كلاهما|Both','لا شيء|Neither'],1,6],
    ['hr-16','input','اكتب كلمة واحدة تصف شعورك الآن.','Type one word describing how you feel now.',[],0,6,{answer:'*'}],
    ['hr-17','choice','لو ظهر رقم على الشاشة لم تكتبه، هل تحفظه في ذاكرتك؟','If a number appears that you did not type, do you memorize it?',['نعم|Yes','لا|No','أتحقق منه|Check it','أتجاهله|Ignore it'],2,7],
    ['hr-18','choice','إذا شعرت أن الصوت يتحرك من خلفك إلى جانبك، هل تلتفت؟','If the sound seems to move from behind you to your side, do you turn?',['نعم|Yes','لا|No','أخفض الصوت|Lower volume','أخرج|Exit'],0,7],
    ['hr-19','choice','هل تستطيع الاستمرار إذا لم تحصل على أي تفسير؟','Can you continue without receiving any explanation?',['نعم|Yes','لا|No','ربما|Maybe','أحتاج تفسيرًا|I need an explanation'],0,8],
    ['hr-20','choice','إذا قيل لك إن السؤال التالي سيستمر بعد خروجك، ماذا تختار؟','If told the next question continues after you leave, what do you choose?',['أستمر|Continue','أخرج|Leave','أعيد الصفحة|Reload','أتجاهل الرسالة|Ignore it'],0,8],
    ['hr-21','choice','أي أسوأ: أن تعرف أن هناك من يراقب، أم ألا تعرف؟','Which is worse: knowing someone is watching or not knowing?',['أن أعرف|Knowing','ألا أعرف|Not knowing','كلاهما|Both','لا فرق|No difference'],1,8],
    ['hr-22','choice','لو سمعت طرقًا واحدًا ثم صمتًا طويلًا، هل تتوقع الثاني؟','If you hear one knock then a long silence, do you expect a second?',['نعم|Yes','لا|No','ربما|Maybe','لا أفكر|I do not think about it'],0,9],
    ['hr-23','choice','إذا أصبحت الخيارات أربعة بدل ثلاثة دون سبب، هل تختار أسرع؟','If options become four instead of three without explanation, do you choose faster?',['نعم|Yes','لا|No','أتوقف|Stop','أقرأها كلها|Read them all'],3,9],
    ['hr-24','choice','لو ظهر اسمك داخل نص السؤال، هل تعتبره جزءًا من اللعبة؟','If your name appears inside the question, do you consider it part of the game?',['نعم|Yes','لا|No','أتحقق أولًا|Check first','أخرج|Exit'],2,9],
    ['hr-25','input','اكتب الرقم الذي تشعر أنه سيظهر بعد قليل.','Type the number you feel will appear next.',[],0,9,{answer:'*'}],
    ['hr-26','choice','إذا تغيّر اتجاه النص للحظة، ما أول شيء تفعله؟','If the text direction changes for a moment, what do you do first?',['أكمل|Continue','أتحقق من الشاشة|Check the screen','أخرج|Exit','أغلق الصوت|Mute'],1,10],
    ['hr-27','choice','لو ظهر زر واحد فقط مكتوب عليه “استمر”، هل تضغطه؟','If only one button appears saying “continue”, do you press it?',['نعم|Yes','لا|No','أنتظر|Wait','أغادر|Leave'],0,10],
    ['hr-28','choice','هل الصمت الكامل في غرفة مظلمة يخيفك أكثر من الصوت؟','Is complete silence in a dark room scarier than sound?',['نعم|Yes','لا|No','يعتمد|Depends','لا شيء|Neither'],2,10],
    ['hr-29','choice','إذا بدأ السؤال يعكس صياغته أمامك، هل تحاول قراءته حتى النهاية؟','If the question starts changing its wording in front of you, do you read it to the end?',['نعم|Yes','لا|No','أعيد التحميل|Reload','أخرج|Exit'],0,10],
    ['hr-30','choice','آخر سؤال في هذه الدورة: هل كنت تختار الإجابات أم كانت الإجابات تختارك؟','Final question of this cycle: were you choosing the answers, or were the answers choosing you?',['أنا أختار|I choose','الأسئلة تختار|The questions choose','كلاهما|Both','لا أعرف|I do not know'],3,10]
  ];
  horrorExtra.forEach(([id,type,arq,enq,opts,c,d,extra])=>{
    const answers=opts.map(v=>{const [ar,en]=v.split('|');return O(ar,en,en,en,en)});
    bank.horror.questions.push(Q(id,type,O(arq,enq,enq,enq,enq),answers,c,d,extra||{}));
  });

  // Additional modes: compact but deep pools generated from stable unique templates.
  bank.memory={id:'memory',icon:'🧩',xp:105,title:O('مختبر الذاكرة','Memory Lab','记忆实验室','मेमोरी लैब','Laboratorio de memoria'),desc:O('اختبارات ذاكرة وتسلسل وانتباه، مع أنماط مختلفة عن الاختيار التقليدي.','Memory, sequence and attention tests beyond ordinary multiple choice.','记忆、序列和注意力测试，不只是选择题。','स्मृति, अनुक्रम और ध्यान के मिश्रित परीक्षण।','Memoria, secuencias y atención más allá del test clásico.'),questions:[]};
  bank.strategy={id:'strategy',icon:'♜',xp:115,title:O('غرفة الاستراتيجية','Strategy Room','策略房间','रणनीति कक्ष','Sala de estrategia'),desc:O('قرارات تحت ضغط وموارد محدودة.','Decisions under pressure and limited resources.','在压力与有限资源下做决策。','दबाव और सीमित संसाधनों में निर्णय।','Decisiones bajo presión y recursos limitados.'),questions:[]};
  bank.math={id:'math',icon:'➗',xp:120,title:O('الرياضيات المتقدمة','Advanced Math','高级数学','उन्नत गणित','Matemáticas avanzadas'),desc:O('حساب ومنطق عددي بمستوى مرتفع.','High-level arithmetic and numerical logic.','高难度计算与数值逻辑。','उच्च स्तर की गणना और संख्यात्मक तर्क।','Cálculo y lógica numérica avanzada.'),questions:[]};

  const fill=(id,items)=>{bank[id].questions=items.map((x,i)=>Q(`${id}-${String(i+1).padStart(2,'0')}`,x.type,O(x.ar,x.en,x.zh||x.en,x.hi||x.en,x.es||x.en),x.answers||[],x.c||0,x.d,x.extra||{}))};
  fill('memory',[
    {type:'choice',ar:'رتب الأرقام ذهنيًا ثم اختر الترتيب الصحيح: 7،2،9،4',en:'Remember 7,2,9,4. Which order is correct?',answers:[O('7294','7294'),O('2749','2749'),O('7942','7942'),O('9274','9274')],c:0,d:1},
    {type:'number',ar:'احفظ 3،8،1،6 ثم أدخل الرقم الثالث.',en:'Remember 3,8,1,6 then enter the third number.',c:1,d:2,extra:{answer:'1'}},
    {type:'choice',ar:'ما العنصر المختلف في السلسلة: دائرة، مثلث، دائرة، مربع؟',en:'Which item breaks the pattern: circle, triangle, circle, square?',answers:[O('الأول','First'),O('الثاني','Second'),O('الثالث','Third'),O('الرابع','Fourth')],c:3,d:3},
    {type:'number',ar:'إذا حفظت 14،22،31،40، ما مجموع الرقمين الأوسطين؟',en:'Remember 14,22,31,40. Sum the two middle values.',c:53,d:4,extra:{answer:'53'}},
    {type:'choice',ar:'تذكر التسلسل: أحمر، أزرق، أخضر، أصفر. ما اللون الثاني؟',en:'Remember: red, blue, green, yellow. What was second?',answers:[O('أحمر','Red'),O('أزرق','Blue'),O('أخضر','Green'),O('أصفر','Yellow')],c:1,d:5},
    {type:'input',ar:'احفظ 6-1-9-3 ثم اكتبها معكوسة.',en:'Remember 6-1-9-3 then type it reversed.',c:0,d:6,extra:{answer:'3916'}},
    {type:'choice',ar:'أي سلسلة تطابق النمط الذي رأيته: ▲ ● ■ ▲ ● ؟',en:'Which completes the pattern: ▲ ● ■ ▲ ● ?',answers:[O('▲','▲'),O('●','●'),O('■','■'),O('◆','◆')],c:2,d:7},
    {type:'number',ar:'احفظ 17،4،29،8،11. ما حاصل 17+8؟',en:'Remember 17,4,29,8,11. What is 17+8?',c:25,d:8,extra:{answer:'25'}},
    {type:'choice',ar:'أي رقم كان في الموقع الرابع في التسلسل: 5،12،3،19،7،2؟',en:'Which number was fourth in: 5,12,3,19,7,2?',answers:[O('3','3'),O('12','12'),O('19','19'),O('7','7')],c:2,d:9},
    {type:'input',ar:'تذكر 4-8-2-7-1 ثم اكتب الرقمين الأول والأخير متجاورين.',en:'Remember 4-8-2-7-1 then enter the first and last digits together.',c:0,d:10,extra:{answer:'41'}}
  ]);
  fill('strategy',[
    {type:'choice',ar:'لديك 10 وحدات طاقة ومهمتان: الأولى 7 والثانية 6. لا يمكنك تنفيذ إلا واحدة الآن. اختر المهمة الأعلى عائدًا إذا كان عائد الأولى 20 والثانية 24.',en:'You have 10 energy; tasks cost 7 and 6. Rewards are 20 and 24. Which is better now?',answers:[O('الأولى','First'),O('الثانية','Second'),O('أي واحدة','Either'),O('لا تنفذ','None')],c:1,d:1},
    {type:'choice',ar:'خصمك يملك سرعة أعلى لكن دفاعه ضعيف. ما الخطة الأكثر منطقية؟',en:'Opponent is faster but has weak defense. Best plan?',answers:[O('هجوم سريع مع تغيير الاتجاه','Fast attack with direction changes'),O('الانتظار فقط','Only wait'),O('إبطاء كل شيء','Slow everything'),O('عدم التحرك','Do not move')],c:0,d:2},
    {type:'number',ar:'ميزانية 50، تكلفة القرار الأول 18 والثاني 17. كم يتبقى إذا اخترت الاثنين؟',en:'Budget 50; costs 18 and 17. How much remains after both?',c:15,d:3,extra:{answer:'15'}},
    {type:'choice',ar:'في لعبة موارد، المخزون ممتلئ تقريبًا وظهر عنصر نادر مؤقت. ماذا تفعل؟',en:'Inventory is nearly full and a rare temporary item appears. Best move?',answers:[O('تتجاهله','Ignore it'),O('تستبدل عنصرًا منخفض القيمة','Replace a low-value item'),O('تنتظر حتى يختفي','Wait'),O('تغلق اللعبة','Quit')],c:1,d:4},
    {type:'choice',ar:'إذا كان خصمك يكرر نفس الهجوم، ما أفضل استجابة استراتيجية؟',en:'If an opponent repeats the same attack, best strategic response?',answers:[O('التكيف واستغلال النمط','Adapt and exploit the pattern'),O('تكرار نفس الخطأ','Repeat the same mistake'),O('التوقف','Stop'),O('التخمين العشوائي','Random guess')],c:0,d:5},
    {type:'choice',ar:'لديك 3 أدوار فقط: اجمع معلومات، نفذ، ثم صحح. ما الترتيب الأفضل غالبًا؟',en:'You have 3 turns: gather info, act, correct. Best order?',answers:[O('معلومات ← تنفيذ ← تصحيح','Info → act → correct'),O('تصحيح ← تنفيذ ← معلومات','Correct → act → info'),O('تنفيذ فقط','Act only'),O('عشوائي','Random')],c:0,d:6},
    {type:'number',ar:'موردك 100 وينخفض 15% كل جولة. بعد جولتين كم تقريبًا؟',en:'A resource of 100 falls by 15% each round. After two rounds?',c:72.25,d:7,extra:{answer:'72.25'}},
    {type:'choice',ar:'خصمك يحاول دفعك لاتخاذ قرار سريع عندما تكون معلوماتك ناقصة. ما الأفضل؟',en:'Opponent pressures you to decide quickly with incomplete information. Best move?',answers:[O('تأخير القرار لجمع معلومة حاسمة','Delay to gather a decisive fact'),O('الاندفاع','Rush'),O('التخلي عن الخطة','Abandon plan'),O('اختيار عشوائي','Random choice')],c:0,d:8},
    {type:'choice',ar:'في وضع 2 مقابل 1، ما الذي يزيد الخيارات؟',en:'In a 2-v-1 situation, what increases options?',answers:[O('تثبيت المدافع ثم تغيير الزاوية','Fix the defender then change angle'),O('الوقوف','Stand still'),O('إخفاء المساحة','Hide space'),O('التراجع دائمًا','Always retreat')],c:0,d:9},
    {type:'choice',ar:'لديك معلومتان صحيحتان وواحدة مشكوك بها. قرارك عالي المخاطر. ما النهج الأفضل؟',en:'Two facts are reliable and one is uncertain. High-risk decision. Best approach?',answers:[O('ابن القرار على المؤكد واختبر المشكوك','Base on reliable facts and test the uncertain one'),O('تجاهل كل شيء','Ignore everything'),O('اعتمد على المشكوك فقط','Use the uncertain fact only'),O('تخمين','Guess')],c:0,d:10}
  ]);
  fill('math',[
    {type:'number',ar:'احسب: 48 ÷ 6 + 7',en:'Calculate: 48 ÷ 6 + 7',c:15,d:1,extra:{answer:'15'}},
    {type:'number',ar:'إذا كان 3x=27، فما x؟',en:'If 3x=27, what is x?',c:9,d:2,extra:{answer:'9'}},
    {type:'choice',ar:'أي كسر أكبر؟',en:'Which fraction is largest?',answers:[O('3/8','3/8'),O('5/12','5/12'),O('4/9','4/9'),O('7/16','7/16')],c:2,d:3},
    {type:'number',ar:'مساحة مستطيل 12×7؟',en:'Area of a 12×7 rectangle?',c:84,d:4,extra:{answer:'84'}},
    {type:'choice',ar:'ما العدد الذي إذا زاد 20% أصبح 72؟',en:'What number becomes 72 after a 20% increase?',answers:[O('54','54'),O('60','60'),O('64','64'),O('66','66')],c:1,d:5},
    {type:'number',ar:'حل: 2x+5=19',en:'Solve: 2x+5=19',c:7,d:6,extra:{answer:'7'}},
    {type:'choice',ar:'ما مجموع الزوايا الداخلية لمسدس؟',en:'Sum of interior angles of a hexagon?',answers:[O('540°','540°'),O('600°','600°'),O('720°','720°'),O('900°','900°')],c:0,d:7},
    {type:'number',ar:'إذا كان المتوسط لـ 8 و12 و16 وx يساوي 14، فما x؟',en:'Mean of 8,12,16,x is 14. Find x.',c:20,d:8,extra:{answer:'20'}},
    {type:'choice',ar:'حل المعادلة: x²=81 مع x موجب.',en:'Solve x²=81 for positive x.',answers:[O('7','7'),O('8','8'),O('9','9'),O('10','10')],c:2,d:9},
    {type:'number',ar:'متتالية حسابية تبدأ 7 وفرقها 13. ما الحد العاشر؟',en:'Arithmetic sequence starts at 7 with common difference 13. 10th term?',c:124,d:10,extra:{answer:'124'}}
  ]);

  // V53 — Forensic Lab: cinematic detective case (non-graphic)
  bank.forensic={id:'forensic',icon:'🕵️',xp:150,title:O('المختبر الجنائي','Forensic Lab','法医实验室','फोरेंसिक लैब','Laboratorio forense'),desc:O('مسرح جريمة درامي غير دموي: اجمع الأدلة، اربط التوقيت، واكشف الرواية الأكثر اتساقًا.','A cinematic, non-graphic crime scene: collect clues, connect the timeline, and uncover the most consistent story.','电影式非血腥犯罪现场：收集线索、连接时间线，找出最一致的真相。','सिनेमाई, गैर-ग्राफिक अपराध दृश्य: सुराग जोड़ें, समयरेखा बनाएं और सबसे संगत कहानी खोजें।','Escena criminal cinematográfica sin contenido gráfico: reúne pistas, conecta la línea temporal y descubre la historia más coherente.'),questions:[
    Q('forensic-01','choice',O('الساعة 22:14. وصلت إلى شقة المحقق سامر. لا توجد آثار اقتحام على الباب. ما الاستنتاج الأول الأكثر منطقية؟','22:14. You arrive at investigator Samer’s apartment. No forced entry is visible. What is the most logical first inference?','22:14。你到达调查员萨默的公寓。门上没有撬锁痕迹。最合理的第一推断是什么？','22:14। आप अन्वेषक समीर के अपार्टमेंट पहुँचते हैं। जबरन प्रवेश के निशान नहीं हैं। पहला तार्किक निष्कर्ष क्या है?','22:14. Llegas al apartamento del investigador Samer. No hay señales de entrada forzada. ¿Cuál es la primera inferencia lógica?'),[O('الفاعل كان يملك مفتاحًا أو دخل بإذن','The person had a key or entered with permission'),O('الجريمة مستحيلة','The crime is impossible'),O('الفاعل كسر النافذة بالتأكيد','The person definitely broke a window'),O('لا يمكن أن يكون هناك فاعل','There can be no perpetrator')],0,1,{image:'assets/forensic/scene-door.svg'}),
    Q('forensic-02','choice',O('وجدت فنجان قهوة دافئًا وبجانبه هاتف يعرض 21:50. ماذا تفعل قبل بناء أي نظرية؟','You find warm coffee beside a phone showing 21:50. What do you do before forming a theory?','你发现一杯温咖啡，旁边的手机显示21:50。在形成理论前你会做什么？','आपको गर्म कॉफी और 21:50 दिखाता फोन मिलता है। सिद्धांत बनाने से पहले क्या करेंगे?','Encuentras café caliente junto a un teléfono que marca 21:50. ¿Qué haces antes de formular una teoría?'),[O('توثق الدليل وتتحقق من دقة وقت الهاتف','Document the evidence and verify the phone time'),O('تعتبر 21:50 وقت الجريمة حتمًا','Assume 21:50 is definitely the crime time'),O('تتجاهل الفنجان','Ignore the cup'),O('تتهم أول شخص تعرفه','Accuse the first person you know')],0,2,{image:'assets/forensic/scene-desk.svg'}),
    Q('forensic-03','choice',O('كاميرا الممر سجلت شخصًا يدخل 21:42 ويخرج 21:47. سجل هاتف الضحية آخر اتصال 21:44. أي معلومة أقوى لتحديد نافذة زمنية أولية؟','A hallway camera records someone entering at 21:42 and leaving at 21:47. The victim’s phone logs a final call at 21:44. Which is stronger for an initial time window?','走廊摄像头记录某人21:42进入、21:47离开。受害者手机最后通话为21:44。哪条信息更适合确定初步时间窗口？','कॉरिडोर कैमरा 21:42 प्रवेश और 21:47 निकास दिखाता है। पीड़ित के फोन पर अंतिम कॉल 21:44 है। शुरुआती समय-सीमा के लिए कौन सी जानकारी मजबूत है?','La cámara registra entrada a las 21:42 y salida a las 21:47. El teléfono de la víctima registra una última llamada a las 21:44. ¿Qué dato sirve mejor para una ventana inicial?'),[O('التقاطع بين السجلين: تقريبًا 21:42–21:47','The overlap: roughly 21:42–21:47'),O('21:00 فقط','21:00 only'),O('22:30 فقط','22:30 only'),O('لا توجد نافذة زمنية','There is no time window')],0,3,{image:'assets/forensic/scene-camera.svg'}),
    Q('forensic-04','choice',O('على الطاولة ورقة ممزقة، وفي سلة المهملات نصفها الآخر. ما أفضل خطوة؟','A torn note is on the desk and its other half is in the bin. Best next step?','桌上有一张撕碎的纸，另一半在垃圾桶里。最佳下一步是什么？','मेज पर फटा नोट है और उसका दूसरा हिस्सा कूड़ेदान में है। अगला सर्वोत्तम कदम?','Hay una nota rota en la mesa y la otra mitad en la papelera. ¿Mejor siguiente paso?'),[O('مطابقة الحواف وتصويرها قبل لمسها','Match the edges and photograph them before handling'),O('لصقها فورًا','Tape it immediately'),O('رميها لأنها غير مهمة','Discard it'),O('كتابة محتوى متخيل','Invent its content')],0,4),
    Q('forensic-05','choice',O('شاهد قال إن المصباح كان مطفأً عند 21:30، لكن حساسًا ذكيًا سجّل تشغيله 21:31. ما المنهج الأفضل؟','A witness says the light was off at 21:30, but a smart sensor logged it on at 21:31. Best approach?','证人称21:30灯是关的，但智能传感器记录21:31开启。最佳方法是什么？','गवाह कहता है 21:30 पर लाइट बंद थी, लेकिन स्मार्ट सेंसर ने 21:31 पर चालू दर्ज किया। सर्वोत्तम तरीका?','Un testigo dice que la luz estaba apagada a las 21:30, pero un sensor registró encendido a las 21:31. ¿Mejor enfoque?'),[O('اعتبار التعارض قرينة تحتاج تحققًا لا دليلًا حاسمًا','Treat the conflict as a clue requiring verification, not decisive proof'),O('اختيار الشاهد فورًا','Choose the witness immediately'),O('اختيار الحساس دائمًا','Always choose the sensor'),O('حذف المعلومتين','Discard both')],0,5),
    Q('forensic-06','choice',O('بصمة على كوب تبدو حديثة، لكن لا تعرف متى وُضع الكوب. ماذا تثبت البصمة وحدها؟','A fingerprint on a cup appears recent, but you do not know when the cup was placed. What does the print alone prove?','杯子上的指纹看起来很新，但你不知道杯子何时放置。单凭指纹能证明什么？','कप पर उंगलियों का निशान नया लगता है, लेकिन कप कब रखा गया पता नहीं। अकेला निशान क्या साबित करता है?','Una huella en una taza parece reciente, pero no sabes cuándo se colocó. ¿Qué demuestra por sí sola?'),[O('أن الشخص لمس الكوب في وقت غير محدد','That the person touched the cup at an unspecified time'),O('وقت الجريمة بالضبط','The exact crime time'),O('أن الشخص هو الجاني','That the person is the perpetrator'),O('أن الكوب سُرق','That the cup was stolen')],0,6),
    Q('forensic-07','choice',O('ثلاثة مشتبهين: الأول لديه دافع بلا فرصة، الثاني فرصة بلا دافع، والثالث لديه دافع وفرصة لكن لا دليل مادي. ما القرار المهني؟','Three suspects: one has motive but no opportunity, one opportunity but no motive, and the third has both but no physical evidence. Professional decision?','三名嫌疑人：一人有动机无机会，一人有机会无动机，第三人两者都有但无物证。专业决定是什么？','तीन संदिग्ध: पहले के पास मकसद लेकिन अवसर नहीं, दूसरे के पास अवसर लेकिन मकसद नहीं, तीसरे के पास दोनों हैं但物证 नहीं। पेशेवर निर्णय?','Tres sospechosos: uno tiene motivo sin oportunidad, otro oportunidad sin motivo y el tercero ambos pero sin evidencia física. ¿Decisión profesional?'),[O('اعتبار الثالث محور التحقيق مع عدم اعتباره مدانًا','Make the third a priority for investigation without treating them as guilty'),O('اعتقال الثالث حتمًا','Arrest the third automatically'),O('استبعاد الأول والثاني نهائيًا','Exclude the first two permanently'),O('إغلاق القضية','Close the case')],0,7),
    Q('forensic-08','choice',O('وجدت رسالة تقول: «لا تثق بالشخص الذي يصل بعد التاسعة». لماذا لا تكفي وحدها لاتهام شخص؟','You find a note: “Do not trust the person who arrives after nine.” Why is it insufficient alone to accuse someone?','你发现一张纸条：“不要相信九点后到的人。”为什么不能仅凭它指控某人？','आपको एक नोट मिलता है: “नौ बजे के बाद आने वाले पर भरोसा मत करो।” अकेले इससे किसी पर आरोप क्यों नहीं लगाया जा सकता?','Encuentras una nota: “No confíes en quien llegue después de las nueve”. ¿Por qué no basta para acusar?'),[O('لأن السياق والكاتب والمقصود غير مثبتة','Because context, authorship and intended person are unverified'),O('لأن الرسائل دائمًا كاذبة','Because notes are always false'),O('لأن الساعة لا تعمل','Because clocks never work'),O('لأن كل شخص بريء','Because everyone is innocent')],0,8),
    Q('forensic-09','choice',O('تظهر الكاميرا انقطاعًا من 21:46 إلى 21:49. ماذا يعني ذلك؟','The camera shows a gap from 21:46 to 21:49. What does that mean?','摄像头在21:46到21:49出现空档。这意味着什么？','कैमरे में 21:46 से 21:49 तक गैप है। इसका क्या अर्थ है?','La cámara tiene un hueco de 21:46 a 21:49. ¿Qué significa?'),[O('هناك فجوة تحتاج تفسيرًا ولا تثبت وحدها من فعلها','There is a gap requiring explanation; it does not by itself prove who caused it'),O('المشتبه الثالث هو الفاعل بالتأكيد','The third suspect definitely caused it'),O('الجريمة حدثت في 21:47 حتمًا','The crime definitely happened at 21:47'),O('الكاميرا كانت سليمة طوال الوقت','The camera was working perfectly')],0,9),
    Q('forensic-10','choice',O('بعد جمع الأدلة، لديك روايتان. الأولى تحتاج 6 افتراضات غير مثبتة، والثانية تحتاج افتراضين فقط وتفسر كل الأدلة المعروفة. ماذا تختار؟','After collecting evidence, you have two narratives. One needs six unverified assumptions; the other needs two and explains all known evidence. Which is stronger?','收集证据后有两个故事。第一个需要六个未证实假设，第二个只需两个并解释所有已知证据。哪个更强？','साक्ष्य के बाद दो कथाएँ हैं। पहली को छह अप्रमाणित धारणाएँ चाहिए; दूसरी को दो और सभी ज्ञात साक्ष्य समझाती है। कौन मजबूत है?','Tras reunir pruebas hay dos relatos. Uno necesita seis suposiciones no verificadas; el otro dos y explica toda la evidencia conocida. ¿Cuál es más sólido?'),[O('الثانية، مع استمرار اختبارها بأدلة إضافية','The second, while continuing to test it with more evidence'),O('الأولى لأنها أعقد','The first because it is more complex'),O('الأولى لأنها مثيرة','The first because it is more dramatic'),O('لا نحتاج أدلة إضافية','No more evidence is needed')],0,10)
  ]};
  Object.values(bank).forEach(ch=>ch.questions.forEach((q,i)=>{q.id=q.id||`${ch.id}-${i+1}`}));
  window.ZIVOZONE_CHALLENGES=bank;
  window.ZIVOZONE_CHALLENGES.get=id=>bank[id]||null;
  window.ZIVOZONE_CHALLENGES.getAll=()=>Object.values(bank).filter(x=>x&&!x.special);
})();

/* ============================================================
   V18 — EXPANDED CHALLENGE BANK
   10-question runs, escalating 1→10.
   Types: sequence, numeric, text, pattern, logic, odd-one-out.
   Existing challenge banks above are preserved.
============================================================ */
window.ZIVOZONE_V18_BANK = {
  logic: {
    id:"logic_v18", title:"Logic Lab", icon:"🧠", special:false,
    questions:[
      {id:"logic18_01",type:"numeric",difficulty:1,q:"أكمل: 2، 4، 6، 8، ؟",answer:"10"},
      {id:"logic18_02",type:"numeric",difficulty:2,q:"أكمل: 3، 6، 12، 24، ؟",answer:"48"},
      {id:"logic18_03",type:"text",difficulty:3,q:"أي كلمة لا تنتمي: تفاحة، برتقالة، موزة، كرسي؟",answer:"كرسي"},
      {id:"logic18_04",type:"numeric",difficulty:4,q:"إذا كان 5 + 3 = 16 و 4 + 2 = 12 وفق قاعدة ثابتة، فما 6 + 2؟",answer:"16"},
      {id:"logic18_05",type:"numeric",difficulty:5,q:"أكمل: 1، 4، 9، 16، 25، ؟",answer:"36"},
      {id:"logic18_06",type:"numeric",difficulty:6,q:"عدد إذا ضربته في نفسه ثم أضفت 6 حصلت على 42. ما العدد الموجب؟",answer:"6"},
      {id:"logic18_07",type:"text",difficulty:7,q:"لديك 3 مفاتيح خارج غرفة و3 مصابيح داخلها. يمكنك دخول الغرفة مرة واحدة فقط. كيف تعرف أي مفتاح لأي مصباح؟ اكتب الفكرة المختصرة.",answer:"تشغيل مفتاح ثم إطفاؤه وتشغيل الثاني ثم الدخول وفحص الضوء والحرارة"},
      {id:"logic18_08",type:"numeric",difficulty:8,q:"أكمل: 2، 3، 5، 8، 13، 21، ؟",answer:"34"},
      {id:"logic18_09",type:"text",difficulty:9,q:"رجل ينظر إلى صورة ويقول: ليس لي أخ أو أخت، لكن والد هذا الرجل هو ابن أبي. من في الصورة؟",answer:"ابنه"},
      {id:"logic18_10",type:"numeric",difficulty:10,q:"لديك 8 كرات متشابهة، واحدة أثقل. بميزان كفتين ووزنتين فقط، كيف تعثر عليها؟ اكتب الخطوات.",answer:"3 مقابل 3 ثم وزن كرة مقابل كرة من المجموعة الأثقل أو المتبقية"}
    ]
  },
  pattern: {
    id:"pattern_v18", title:"Pattern Break", icon:"🔷", special:false,
    questions:[
      {id:"pattern18_01",type:"sequence",difficulty:1,q:"أكمل النمط: A B A B A ؟",answer:"B"},
      {id:"pattern18_02",type:"sequence",difficulty:2,q:"أكمل: 10، 20، 30، 40، ؟",answer:"50"},
      {id:"pattern18_03",type:"sequence",difficulty:3,q:"أكمل: 1، 2، 4، 7، 11، ؟",answer:"16"},
      {id:"pattern18_04",type:"sequence",difficulty:4,q:"أكمل: 81، 27، 9، 3، ؟",answer:"1"},
      {id:"pattern18_05",type:"sequence",difficulty:5,q:"أكمل: 2، 6، 12، 20، 30، ؟",answer:"42"},
      {id:"pattern18_06",type:"sequence",difficulty:6,q:"أكمل: 1، 1، 2، 3، 5، 8، ؟",answer:"13"},
      {id:"pattern18_07",type:"sequence",difficulty:7,q:"أكمل: 100، 96، 88، 76، 60، ؟",answer:"40"},
      {id:"pattern18_08",type:"sequence",difficulty:8,q:"أكمل: 3، 8، 15، 24، 35، ؟",answer:"48"},
      {id:"pattern18_09",type:"sequence",difficulty:9,q:"أكمل: 1، 3، 6، 10، 15، 21، ؟",answer:"28"},
      {id:"pattern18_10",type:"sequence",difficulty:10,q:"أكمل: 2، 5، 11، 23، 47، ؟",answer:"95"}
    ]
  },
  focus: {
    id:"focus_v18", title:"Focus Trap", icon:"🎯", special:false,
    questions:[
      {id:"focus18_01",type:"text",difficulty:1,q:"اكتب الكلمة الثالثة فقط: أحمر — أزرق — أخضر — أصفر",answer:"أخضر"},
      {id:"focus18_02",type:"text",difficulty:2,q:"كم مرة يظهر حرف الألف في: باب؟",answer:"1"},
      {id:"focus18_03",type:"numeric",difficulty:3,q:"من الأرقام 7، 2، 9، 4 اكتب الأصغر.",answer:"2"},
      {id:"focus18_04",type:"text",difficulty:4,q:"اكتب آخر كلمة: قمر، شمس، نجمة، بحر",answer:"بحر"},
      {id:"focus18_05",type:"numeric",difficulty:5,q:"ما الرقم الذي لا ينتمي: 2، 4، 8، 15، 16؟",answer:"15"},
      {id:"focus18_06",type:"text",difficulty:6,q:"أي كلمة مختلفة: كتاب، قلم، دفتر، تفاحة؟",answer:"تفاحة"},
      {id:"focus18_07",type:"numeric",difficulty:7,q:"إذا طلبت منك تجاهل الرقم 7 واختيار أكبر رقم من 3، 9، 5، 8، ما إجابتك؟",answer:"9"},
      {id:"focus18_08",type:"text",difficulty:8,q:"اقرأ بدقة: واحد، اثنان، أربعة، ثلاثة. ما الكلمة التي تخالف الترتيب الطبيعي؟",answer:"أربعة"},
      {id:"focus18_09",type:"numeric",difficulty:9,q:"ما العدد المختلف: 12، 18، 24، 31، 36؟",answer:"31"},
      {id:"focus18_10",type:"text",difficulty:10,q:"اكتب فقط أول حرف من كلمة «انتباه».",answer:"ا"}
    ]
  }
};

window.ZIVOZONE_V18 = {
  version:18,
  banks:window.ZIVOZONE_V18_BANK,
  normalize:function(v){
    return String(v??"").trim().toLowerCase()
      .replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه")
      .replace(/[،,؛;]/g," ").replace(/\s+/g," ");
  },
  get:function(id){
    const b=this.banks[id]; if(!b)return null;
    return JSON.parse(JSON.stringify(b));
  },
  all:function(){return Object.values(this.banks).map(x=>JSON.parse(JSON.stringify(x)))},
  scoreAnswer:function(question,value){
    const a=this.normalize(question.answer),v=this.normalize(value);
    return a===v || (question.alternatives||[]).some(x=>this.normalize(x)===v);
  },
  makeRun:function(id,used){
    const b=this.get(id); if(!b)return null;
    const seen=new Set(used||[]);
    const fresh=b.questions.filter(q=>!seen.has(q.id));
    const pool=(fresh.length>=10?fresh:b.questions.slice()).sort(()=>Math.random()-.5);
    return Object.assign({},b,{questions:pool.slice(0,10).sort((a,b)=>a.difficulty-b.difficulty)});
  }
};


/* ============================================================
   ZIVOZONE V40 — CHALLENGE EXPANSION BANK
   10-question packs, escalating difficulty, additive only.
============================================================ */
(function(){
  'use strict';
  const packs={
    logic_extreme:{
      id:'logic_extreme',title:'المنطق المتقدم',description:'أنماط واستدلال منطقي بتصعيد حقيقي',questions:[
        {q:'ما العدد التالي: 2، 6، 12، 20، 30، ؟',options:['40','42','44','46'],answer:1},
        {q:'إذا كانت كل A هي B، وبعض B هي C، فما الذي يلزم؟',options:['كل A هي C','بعض A هي C','لا يلزم أي منهما','كل C هي A'],answer:2},
        {q:'أكمل النمط: 1، 2، 4، 7، 11، 16، ؟',options:['21','22','23','24'],answer:1},
        {q:'ثلاثة أشخاص يقولون: واحد فقط يكذب. الأول: الثاني كاذب. الثاني: الثالث كاذب. الثالث: الأول والثاني كاذبان. من الصادق؟',options:['الأول','الثاني','الثالث','لا أحد'],answer:0},
        {q:'إذا كان اليوم الثلاثاء، فما اليوم بعد 100 يوم؟',options:['الخميس','الجمعة','السبت','الأحد'],answer:1},
        {q:'لديك 8 كرات، واحدة أثقل. بميزان كفتين ووزنتين فقط، هل يمكن تحديدها؟',options:['نعم دائمًا','لا','فقط إذا كانت الثالثة','فقط إذا كانت الرابعة'],answer:0},
        {q:'عدد من رقمين: مجموع رقميه 11، والعدد المعكوس أكبر منه بـ27. ما العدد؟',options:['47','56','65','74'],answer:0},
        {q:'سلسلة: 3، 5، 10، 12، 24، 26، ؟',options:['48','50','52','54'],answer:1},
        {q:'إذا كان احتمال حدث 1/3، واحتمال حدث مستقل آخر 1/2، فما احتمال حدوث الاثنين معًا؟',options:['1/5','1/6','2/5','5/6'],answer:1},
        {q:'لديك 12 قطعة متطابقة ظاهريًا، واحدة مختلفة الوزن ولا تعرف أثقل أم أخف. كم أقل عدد من الوزنات اللازمة في أسوأ حالة؟',options:['2','3','4','5'],answer:1}
      ]
    },
    memory_focus:{
      id:'memory_focus',title:'الذاكرة والتركيز',description:'اختبار تركيز وتسلسل واسترجاع',questions:[
        {q:'أي تسلسل يطابق: 7-2-9-4؟',options:['7-2-9-4','7-9-2-4','2-7-9-4','7-2-4-9'],answer:0},
        {q:'ما الحرف المختلف؟ A A A B A A',options:['الأول','الثالث','الرابع','السادس'],answer:2},
        {q:'ما الرقم الذي ظهر مرتين في السلسلة: 4 8 1 6 3 8 2؟',options:['4','8','6','3'],answer:1},
        {q:'احفظ: قمر، باب، نهر، مفتاح. أي كلمة ليست منها؟',options:['باب','نهر','كتاب','مفتاح'],answer:2},
        {q:'إذا قلبت ترتيب 9-3-7-1، ما النتيجة؟',options:['1-7-3-9','1-3-7-9','9-1-7-3','7-1-3-9'],answer:0},
        {q:'أي تسلسل يحافظ على نفس الترتيب؟',options:['2-5-8-1','2-8-5-1','5-2-8-1','2-5-1-8'],answer:0},
        {q:'أي رقم يأتي ثالثًا في: 6، 1، 9، 4، 2؟',options:['1','9','4','2'],answer:1},
        {q:'ما العنصر الذي ظهر أولًا: نجمة، دائرة، مثلث، مربع؟',options:['المربع','المثلث','الدائرة','النجمة'],answer:3},
        {q:'احفظ: 3-8-6-2-9. ما الرقم الثاني من النهاية؟',options:['6','2','8','9'],answer:1},
        {q:'إذا ظهر التسلسل 5-1-8-3-7-2، فما العنصر الرابع؟',options:['8','3','7','2'],answer:1}
      ]
    },
    football_intelligence:{
      id:'football_intelligence',title:'ذكاء كرة القدم',description:'قرارات تكتيكية وفهم للمباراة',questions:[
        {q:'في بناء اللعب 4-3-3، ما الهدف الأساسي من لاعب الوسط المحور؟',options:['البقاء داخل الصندوق','ربط الخطوط وتوفير خيار تمرير','اللعب كحارس','عدم التحرك'],answer:1},
        {q:'عند فقدان الكرة قريبًا من مرمى الخصم، ما المبدأ الأفضل؟',options:['العودة فورًا بلا ضغط','الضغط العكسي المنظم','ترك المساحة','تغيير الحارس'],answer:1},
        {q:'ماذا يعني خلق التفوق العددي على الجناح؟',options:['زيادة عدد الحكام','وجود لاعب إضافي في منطقة اللعب','تقليل التمريرات','تثبيت المهاجم'],answer:1},
        {q:'متى يكون التمرير بين الخطوط عالي الخطورة؟',options:['عندما تكون المساحة مغلقة والضغط قريبًا','عندما يكون اللاعب حرًا','عند وجود خيار آمن','بعد التوقف'],answer:0},
        {q:'ما فائدة الجناح العكسي غالبًا؟',options:['توسيع الملعب فقط','الدخول للعمق وتهديد المرمى','العودة للحارس دائمًا','منع الظهير من التقدم'],answer:1},
        {q:'في الدفاع المنخفض، أهم شيء؟',options:['المسافات بين الخطوط','الهجوم بأكبر عدد','ترك العمق','إلغاء التواصل'],answer:0},
        {q:'لماذا تستخدم التحولات السريعة؟',options:['لإبطاء اللعب','استغلال عدم تنظيم الخصم','إضاعة الوقت فقط','تغيير الحكم'],answer:1},
        {q:'إذا ضغط الخصم عاليًا، ما الحل التكتيكي المحتمل؟',options:['تثبيت الجميع قرب الحارس','استغلال المساحة خلف الضغط','منع كل التمريرات','إلغاء الحارس'],answer:1},
        {q:'ما أهم عنصر في الضغط الجماعي؟',options:['تحرك لاعب واحد فقط','التوقيت والتغطية والمسافات','الجري العشوائي','الاعتماد على السرعة فقط'],answer:1},
        {q:'أمام دفاع متكتل، أي مبدأ يساعد أكثر؟',options:['توسيع الملعب وتغيير جهة اللعب','تقليل عرض الملعب','إيقاف الحركة','تمريرات عشوائية'],answer:0}
      ]
    }
  };
  window.ZIVOZONE_V40_BANK=packs;
  window.ZIVOZONE_CHALLENGES=window.ZIVOZONE_CHALLENGES||{};
  Object.keys(packs).forEach(k=>{
    if(!window.ZIVOZONE_CHALLENGES[k])window.ZIVOZONE_CHALLENGES[k]=packs[k];
  });
})();
