# Karalama Defteri

![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap)

Adından da anlaşılacağı gibi bir hobi reposu burası. Her şey olabilecek temiz bir sayfa; Tabula Rasa. 

İhtiyaçlarınıza göre kolayca şekillendirebileceğiniz kişisel bir web günlüğü şablonu gibi de düşünebilirsiniz.

...

'Karalama Defteri' HTML ve CSS kullanılarak kotarıldı. Geleneksel dergiler gibi editör kontrollü çalışan yapılar için statik ve kaba bir mimari. Bootstrap çerçevesinin görece yalın sınıfları, mümkün olduğunca ezilmeden, olduğu gibi kullanıldı. Bunun sebebi; niş bir kitleye hitap eden editör kontrollü bir içerik hedefliyor olmak. Bu nedenle karmaşık bir backend yapılandırmasına ihtiyaç duymadım. JSON verilerini çekip ekrana basmak dışında pek de bir şey yapmayan üç beş satırlık Vanilla JS kodları ise, üzerine inşaa etmeyi planladığım içeriğe hizmet eden ufak tefek alt yapı çalışmalarıdır.

Veri aktarımı ile ilgili sorunları çözmek için Fetch API yetti de arttı bile. Araştırmalar sayfasında kullandığım Fisher Yates algoritması ise ufak bir illüzyon sadece. İlk bakışta gözlemciye 'bak bu sayfa dinamik' hissi veriyor ama kandırmaya da çalışmıyor. Sadece, dergimizin (dergi olduğunu varsayalım) sayfalarını okuyucumuzun yerine karıştırıyor.

Günlük işlerimde kullandığım için projeye dahil ettiğim güçlü ve zengin kütüphaneleri daha iyi öğrenmek için, her vidasının nerede olduğunu bildiğim kolay kullanılabilir yalın bir temaya ihtiyacım vardı. 

Boş oturmak yerine; yaptım.

Navbar'ı Footer'ı bile her sayfada elle düzenlenen bu tip sayfalar genellikle komik hatalarıyla anılır. Bu da öyle, eminim tonla dil bilgisi hatası, kırık link vardır. Nihai içeriği oluştururken zaten kendiliğinden yok olacak bu tip zararsız hataları özensizlik yada teknik borçtan saymaya dahi gerek yok bence.

## İçerik

Başlangıçta, lokal sunucuda (`python -m http.server` veya `npx serve` gibi) çalıştırmayı tercih edeceğim türden bir 'şeyler' koleksiyonu yaratmaktı. Ancak yapı şekil kazandıkça, oluşan sistemi bir mühendislik ve tasarım verileri koleksiyonu gibi kullanmanın daha verimli sonuçları olacağını düşündüm ve dümeni usulca o yöne çevirdim.

Henüz kayda değer bir veri yok. Yavaş ve emin adımlarla gelişir mi? 

Deneyeceğim ama zor. Belki... Bilemiyorum, Altan 😉

## Amaç ve/veya Hedefler

- Salt mühendislik için değil, diğer alanlarda da kullanılabilecek hafif, basit, okunabilir, anlaşılması zaman almayan statik bir sayfa / site veya platform mimarisi oluşturmak.

- Farklı JS kütüphanelerini sistemden yalıtılmış şekilde test etmek ve etkin şekilde kullanmak. Zira, gözlemim şu ki; bunların ne işe yaradıklarını kabaca biliyoruz ama pratikte bir işe yaraması için çok kullanmıyoruz. Hak vermiyor değilim. Çünkü bu araçların bir çoğu ekonomik değer yaratma fırsatı bulmadan gelişiyor, çeşitleniyor yada kayboluyorlar. Kaybolmasınlar...

- Genellikle MEP uygulamaları ve ilişkili BIM / IoT teknolojileriyle ilgili doğrulanmış gerçek ve standartlara uygun mühendislik verilerini, araştırmalarını ve vaka çalışmalarını sergilemek. Pek 'cool' bir hedef değil ama ne yapalım, bu benim işim.

- Sayfalarda bahsi geçen konularda çalışanların kendi aralarında (zor ama mümkünse) köprü kumasına, tanışmasına, birlikte projeler üretmesine ufacık da olsa bir katkı sağlamak.

## Dosya Yapısı

Alışıldık değil ama zihin sarayımın antik kolonlarını andırıyor. Yani, bana göre her şey yerli yerinde ve sağlam. Yine de kendi çalışma sistemi dayatmak istemem (ki diğer uygulamaları kullanırken en büyük şikayetim) O yüzden herşeyi modüler yapmaya çalıştım.

Kalabalık görünmesine aldanma. Lazım olanı takar - olmayanı çıkartırsın.  

```base
karalama_defteri/
│
├── assets/
│   │
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── styles.css
│   ├── documents/          # (.md Uzantılı dosyalar)
│   ├── files/              # (Diğer tüm bağımsız dosyalar)
│   ├── js/
│   │   ├── blog.js
│   │   ├── bootstrap.bundle.js
│   │   ├── feed.js
│   │   ├── glossary.js
│   │   ├── messages.js
│   └── media/
│       ├── jpeg/           # (Resim & İllustrasyonlar)
│       └── mpeg/           # (Videolar)
│
├── data/
│   ├── blog_1.json         # (Mikroblog Girdileri 1)
│   ├── blog_2.json         # (Mikroblog Girdileri 2)
│   ├── documents.json      # (Markdown Dosyaları)
│   ├── feed.json           # (Ana Sayfa akışı)
│   ├── glossary.json       # (Terimler Sözlüğü)
│   ├── index.json          # (Dosya Listesi)
│   ├── messages.json       # (Mesajlar)
│   └── resources.json      # (Kaynaklar & Referanslar)
│
├── pages/
│   ├── articles.html
│   ├── charts.html         # (Chart.JS)
│   ├── codes.html          # (Prism)
│   ├── diagrams.html       # (Mermaid)
│   ├── formulas.html       # (KaTeX)
│   ├── gallery.html        # (PhotoSwipe)
│   ├── tabulator.html      # (Tabulator)
│   └── three.html          # (Three.js)
│
├── stories/                # Şimdilik Boş ama Sonrası için gerekli.
│
├── 404.html
├── archive.html
├── blog.html
├── contact.html
├── glossary.html
├── index.html
├── projects.html
├── research.html
├── resources.html
└── terms.html
```

## Çerçeve

Bootstrap v5.3.8

## JS Kütüphaneleri

- ChartJS
- PhotoSwipe
- Prism
- Mermaid
- KaTeX
- MarkedJS
- Tabulator
- ThreeJS
- YAML

## Sayfalar

Her bir kütüphane için farklı şablonlar oluşturdum. Bu sayede tarayıcı tarafına gereksiz yük bindirmemeyi hedefliyorum. Kullanıcının enerjsine ve zamanına saygı göstermek gerektiğini düşünüyorum. Çünkü, hepimiz dolaylı yollardan yaşıyoruz aslında bu sıkıntıları. Şimdilik ve aklım erdiğince böyle bir çözüm bulabildim. Yani makale içinde formül varsa sadece KaTeX, kod blokları varsa Prism, diagram ve şemalar varsa Mermaid'i çağıran şablonu kullanıyoruz.

Marked JS'i ise sadece arşiv sayfasında kullandım. Bu bana, tıpkı Obsidian kullanmak gibi konfor bir alanı yaratıyor. Bir çeşit SSG (Static Site Generator) Hatta dosyaları 'tembellik etmez de' doğru düzgün adlandırırsam bir çeşit CMS (Content Management System)

Gerçi bu kadar HTML bilirken, Markdown'a neden ihtiyaç duyar ki insan? 

Markdown verilerini Olduğu halde kullanmak varken, .md dosyalarını HTML'e render etmek bana pek anlamlı gelmiyor. Yayınlamayı düşündüğüm verilerin yapısı ve hacmiyle ilişkili bir durum olsa gerek. Büyük verilere sahip olmayınca, kafam basmıyor böyle şeylere.

Elbet vardır bir hikmeti.

## Veri Yönetimi

JSON belgelerini küçük veri tabanları gibi kullanıyorum. Büyüdüklerinde (eğer büyürlerse) biraz sıkıntı yaratıcaktır ama sanırım parçalayarak çözebilirim. blog.html sayfası için bunu denedim, çalışıyor gibi ama test etmek için .json verilerinin büyümesini bekleyeceğim. Baktım baş edemiyorum projenin ortalarında SQL Lite'a geçişte sorun yaratmaz diye umut ediyorum. 

Bu yapıyı kullanarak kendi JSON şemalarınızı oluşturmak isterseniz söz dizimi hatalarına dikkat edin. Bir virgül bile büyük sıkıntı yaratıyor ama iyi haber şu ki; genellikle sadece virgüller sıkıntı yaratıyor 😉

Sistem ilkel mi? Evet, nispeten...

Ancak tasarımda kullandığım temel stack oldukça gelişmiş bir teknoloji ürünü ve kapı gibi sağlam.

Herşeyi otomatikleştirme arzumuzu biraz dizginlesek mi acaba?...

## Lisans

Tasarım boyunca açık kaynaklı araçlar kullanmaya özen gösterdim. Benim ürettiğim verileri dilediğiniz gibi kullanabilirsiniz. Ancak repoya dahil ettiğim kütüphaneleri, adı geçen siteleri ve üçüncü parti yazılımları resmi kaynaklarından takip etmenizi şiddetle öneririm. Alt Bilgi satırına "Aksi belirtilmedikçe CC BY ve MIT Lisanları ile korunmaktadır" gibi fiyakalı ifadeler yerleştirebilirdim ama şu aşamada bu kadarı bile ukalalık olurdu.

İçerik zenginleştikçe, bunu ayrıca düşünürüz...

## Dip Not

- Başlangıçta resim galerilerini oluşturmak için LightGallery kütüphanesini kullanmıştım. Bu projenin ticari bir hedefi olmadığı için mesele değil ama eğer, **bu kütüphaneyi kendi projelerinizde kullanacaksanız [resmi sitesinde](https://www.lightgalleryjs.com/) yer alan lisans koşullarını dikkatle incelemelisiniz.** Anladığım kadarıyla bir projenin açık kaynaklı olması, her durumda ücretsiz olduğu anlamına gelmiyor.

- Bir kaç farklı denemenin ardından [PhotoSwipe](https://photoswipe.com/) ile çalışan bir versiyonunu daha tasarlamaya karar verdim. Bu kütüphane de oldukça hafif, kullanışlı ve şık. Büyük oranda işinizi görecektir. Öte yandan [bs5-lightbox](https://trvswgnr.github.io/bs5-lightbox/) kütühanesi de tasarım prensiplerine bire bir uyumlu.

- Sayfalardaki görseller için genellikle picsum.photos kullandım.

- .md uzantılı dosyalarda ise çeşitli AI modelleriyle oluşturduğum görselleri kullandım. Bunu bir ara derinlemesine incelemeliyiz, çünkü ne amaçla kullandığınızı bilince çok işe yarıyorlar.

- contact.html sayfasındaki form çalışmıyor. Sol Panel boş durmasın diye oluşturuldu. Yine de bir form ID'si girerseniz çalışacaktır ama topladığınız veri değersiz olsa da toplamanın bir ton tantanası var. Pek de uğraşmaya değmez.

Gerisi "Lorem Ipsum..."

---

#### To do, or not to do

Eğer yolunuz bu repoya düştüyse, bu kısmı dikkate almayın. Çünkü burası sadece "biraz daha araştırmalı ve öğrenmeliyim dediğim şeyler" koleksiyonu. Tuhaf zamanlarda aklıma gelenleri hızlıca not ettiğim ve her commit'te birlikte kendiliğinden güncellenen bir liste. Çoğu zaman fark etmiyorum bile neler yazdığımı. 

Bakmayın düzenli göründüğüne. Projeyle doğrudan bir alakası yok.

1. [IfcOpenShell](https://ifcopenshell.org/) ve [Bonsai BIM](https://bonsaibim.org/)
2. [PyScript](https://pyscript.net/)
3. [Civil Engineering Software Database (CESDb)](https://www.cesdb.com/)
4. [p5.js](https://p5js.org/)
5. [Twine](https://twinery.org/) için ne alaka demeyin, var bir bildiğim.
6. [Dxf-Parser](https://github.com/gdsestimating/dxf-parser)
7. [LightBox2](https://lokeshdhakar.com/projects/lightbox2/)#   k a r a l a m a _ d e f t e r i  
 