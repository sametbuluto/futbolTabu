# Futbol Tabu Uygulamasi

Bu dokuman, tek cihazda oynanan klasik futbol tabu uygulamasinin urun plani, teknik mimarisi ve gelistirme yol haritasini tanimlar. Hedef, ilk surumu hizli sekilde yayinlanabilir hale getirmek; mimariyi ise ileride online oda, arkadasla oynama ve leaderboard gibi ozelliklere acik kurmaktir.

## 1. Urun Tanimi

### 1.1 Uygulama fikri

Kullanici uygulamayi indirir, iki takim adini girer, oyun ayarlarini belirler ve tek cihaz uzerinden klasik tabu mantigiyla futbol temali kartlari oynar.

Her kartta:
- 1 ana kelime
- 4 veya 5 yasakli kelime

Her turda:
- aktif takim oynar
- sure akar
- oyuncu dogru anlattiysa puan alir
- pas gecerse kart atlanir
- yasakli kelime kullanilirsa veya tabu hatasi olursa ceza uygulanir

Mac sonunda:
- takim puanlari hesaplanir
- kazanan takim gosterilir
- istenirse yeni oyun baslatilir

### 1.2 Ilk surum hedefi

Ilk surumun hedefi buyuk kapsamli bir oyun platformu kurmak degil, saglam bir cekirdek oyun dongusu cikarmaktir.

MVP hedefleri:
- tek cihazda oynanis
- iki takim girisi
- ayarlanabilir tur suresi
- ayarlanabilir tur sayisi
- futbol kart havuzu
- dogru / pas / tabu aksiyonlari
- otomatik puan takibi
- mac sonu sonuc ekrani
- temel ayarlar ve kurallar ekrani
- App Store ve Google Play yayini

### 1.3 Urun ilkeleri

- Oyun 10 saniyede anlasilacak kadar basit olmali.
- Kart akisi hizli olmali, kullanici arayuzde kaybolmamali.
- Puanlama ve tur gecisleri hatasiz olmali.
- Icerik uygulamanin asil degeridir; kart kalitesi dusmemeli.
- Mimari, daha sonra online moda genisletilebilecek sekilde kurulmalidir.

## 2. Kapsam

### 2.1 MVP kapsaminda olanlar

- Acilis / ana menu
- Oyun kurulumu
- Takim isimleri girisi
- Oyun ayarlari:
  - tur suresi
  - toplam tur sayisi
  - pas hakki acik veya kapali
  - tabu cezasi puan dusurme kurali
- Oyun ekrani
- Tur bitti ekrani
- Mac sonucu ekrani
- Kurallar ekrani
- Kart verisinin uygulama icinde gelmesi
- Lokal istatistiklerin temel seviyede tutulmasi

### 2.2 MVP disi ama mimaride dikkate alinacaklar

- Arkadasla online oda
- Gercek zamanli multiplayer
- Kullanici hesabi
- Global leaderboard
- Gunluk gorevler
- Kart paketleri
- Reklam veya abonelik modeli
- Yonetim paneli

### 2.3 Bilincli olarak disarida birakilanlar

- Ilk surumde backend zorunlulugu
- Ilk surumde sosyal giris
- Ilk surumde push notification
- Ilk surumde karma skor sezonlari
- Ilk surumde sesli anlatim analizi veya anti-cheat sistemi

## 3. Hedef Kullanici

Birincil kullanici kitlesi:
- futbolu takip eden arkadas gruplari
- evde veya kafede telefon uzerinden hizli oyun oynamak isteyenler
- bilgi yaristirmasi yerine eglenceli tahmin oyunu arayanlar

Kullanim senaryosu:
- 2 ila 8 kisilik arkadas grubu
- tek telefon masaya konur
- takimlar sirayla oynar
- sure baslar
- skor elle degil, uygulama tarafindan tutulur

## 4. Oyun Kurallari ve Domain Kararlari

### 4.1 Temel kurallar

- Iki takim bulunur.
- Oyun belirlenen tur sayisi kadar oynanir.
- Her tur tek takima aittir.
- Tur suresince kartlar arka arkaya gelir.
- Aksiyonlar:
  - `Dogru`: takima puan ekler
  - `Pas`: kart atlanir, tercihe gore puan etkilemez veya eksi yazmaz
  - `Tabu`: ceza uygular
- Tur sonunda sira diger takima gecer.

### 4.2 Config olarak tutulacak kurallar

- tur suresi: varsayilan 60 saniye
- toplam tur sayisi: varsayilan 6
- dogru cevap puani: varsayilan +1
- tabu cezasi: varsayilan -1
- pas hakki: sinirsiz veya sinirli
- pas cezasi: varsayilan 0

Bu kurallar kod icine gomulmemeli; ayarlardan okunmalidir.

### 4.3 Kart kurallari

Her kart su alanlari tasir:
- benzersiz `id`
- `term`
- `forbiddenWords[]`
- `category`
- `difficulty`
- `language`
- `isActive`

Kalite kurallari:
- yasakli kelimeler ana kelimenin en guclu cagrisimlari olmali
- ana kelimenin koku veya birebir cekimi yasakli listede olmamali
- cok genel kelimeler kullanilmamali
- tekrar eden veya birbirine asiri benzeyen kartlar temizlenmeli

## 5. Teknik Strateji

### 5.1 Onerilen teknoloji secimi

Ilk surum icin onerilen stack:
- `React Native`
- `Expo`
- `TypeScript`
- `Expo Router`
- `Zustand` veya sade bir state store
- `AsyncStorage` veya `SQLite` tabanli lokal veri
- `Jest` + `React Native Testing Library`

Bu secimin nedeni:
- hizli gelistirme
- tek kod tabanindan iOS ve Android cikisi
- AI ile daha verimli iterasyon
- yayin surecinin hizli olmasi

Alternatif:
- `Flutter`

Eger ekip Flutter tarafinda daha gucluyse secilebilir. Ancak bu dokumanin referans mimarisi React Native + Expo uzerinedir.

### 5.2 Mimari yaklasim

Uygulama ilk surumde backend olmadan calisabilir. Ancak is katmani ve veri katmani birbirinden ayrilmali ki ileride online moda gecerken tum kod tabani yeniden yazilmasin.

Onerilen katmanlar:

1. Presentation
- ekranlar
- componentler
- navigation
- local UI state

2. Application
- use case'ler
- oyun akisi
- puan hesaplama
- tur yonetimi
- kart secimi

3. Domain
- entity'ler
- kural nesneleri
- puanlama mantigi
- oyun durum makinesi

4. Data
- kart repository
- settings repository
- session persistence
- lokal storage adapter

### 5.3 Mimari prensipler

- UI oyun mantigini tasimamali.
- Timer mantigi tek yerde yonetilmeli.
- Oyun durumu deterministik olmali.
- Her aksiyon event olarak islenmeli.
- Veri kaynagi soyutlanmali; kartlar bugun lokal JSON ise yarin API olabilir.

## 6. Oyun Motoru Tasarimi

### 6.1 Game state

Uygulamanin ana state modeli:

- `teams`
- `settings`
- `currentRound`
- `activeTeamIndex`
- `remainingSeconds`
- `currentCard`
- `deck`
- `usedCardIds`
- `scores`
- `turnStatus`
- `matchStatus`

### 6.2 Oyun durum akisi

Ana durumlar:
- `idle`
- `setup`
- `countdown`
- `playing`
- `roundEnded`
- `matchEnded`

Gecisler:
- `setup -> countdown`
- `countdown -> playing`
- `playing -> roundEnded`
- `roundEnded -> countdown`
- `roundEnded -> matchEnded`

### 6.3 Aksiyonlar

- `START_MATCH`
- `START_ROUND`
- `TICK`
- `MARK_CORRECT`
- `MARK_PASS`
- `MARK_TABU`
- `END_ROUND`
- `NEXT_ROUND`
- `FINISH_MATCH`
- `RESET_MATCH`

### 6.4 Puanlama kurali

Varsayilan kurallar:
- `MARK_CORRECT`: +1
- `MARK_PASS`: 0
- `MARK_TABU`: -1

Bu kurallar `GameRules` objesi icinden okunmali.

### 6.5 Kart dagitim mantigi

Ilk surum icin en pratik yontem:
- uygulama acildiginda aktif kartlar yuklenir
- deste random siralanir
- kullanilan kartlar isaretlenir
- deste biterse yeni shuffle yapilir

Gelecekte:
- kategori bazli filtre
- zorluk bazli mod
- gunluk paket

## 7. Veri Modeli

### 7.1 Card

```ts
type Card = {
  id: string;
  term: string;
  forbiddenWords: string[];
  category: "player" | "club" | "manager" | "stadium" | "term" | "national_team";
  difficulty: "easy" | "medium" | "hard";
  language: "tr";
  isActive: boolean;
};
```

### 7.2 Team

```ts
type Team = {
  id: string;
  name: string;
  score: number;
};
```

### 7.3 GameSettings

```ts
type GameSettings = {
  roundDurationSeconds: number;
  totalRounds: number;
  correctScore: number;
  passScore: number;
  tabuPenalty: number;
  passLimitEnabled: boolean;
  passLimitPerRound: number | null;
};
```

### 7.4 MatchSession

```ts
type MatchSession = {
  id: string;
  teams: Team[];
  settings: GameSettings;
  currentRound: number;
  activeTeamId: string;
  usedCardIds: string[];
  status: "setup" | "playing" | "roundEnded" | "matchEnded";
  startedAt: string | null;
  endedAt: string | null;
};
```

### 7.5 RoundResult

```ts
type RoundResult = {
  roundNumber: number;
  teamId: string;
  correctCount: number;
  passCount: number;
  tabuCount: number;
  roundScoreDelta: number;
};
```

## 8. Icerik Uretim Sistemi

Bu uygulamanin en kritik asset'i kart havuzudur. Kartlar uygulamadan ayrik bir uretim sureciyle yonetilmelidir.

### 8.1 Onerilen icerik pipeline'i

1. Seed liste olustur
- futbolcu
- kulup
- teknik direktor
- stadyum
- futbol terimi

2. AI ile taslak kart olustur
- ana kelime
- 5 yasakli kelime
- kategori
- zorluk

3. Spreadsheet veya CSV uzerinde manuel edit yap

4. Validation script ile kontrol et
- bos alan var mi
- duplicate var mi
- yasakli kelime sayisi eksik mi
- ana kelime yasakli listede geciyor mu

5. JSON veya SQLite formatina donustur

6. Uygulamaya paketle

### 8.2 Kart adet hedefi

Yayin icin onerilen minimum:
- `300-500` kart

Daha guvenli ilk surum:
- `700-1000` kart

### 8.3 Kategori dagilimi onerisi

- futbolcu: 40%
- kulup: 20%
- terim: 20%
- teknik direktor: 10%
- stadyum ve milli takim: 10%

## 9. UX ve Ekran Akisi

### 9.1 Ekran listesi

1. Splash
2. Home
3. New Game Setup
4. Rules
5. Settings
6. Countdown
7. Game Round
8. Round Summary
9. Match Result
10. Local Stats

### 9.2 Home ekrani

Icerik:
- Yeni Oyun
- Kurallar
- Istatistikler
- Ayarlar

### 9.3 New Game Setup

Alanlar:
- Takim 1 adi
- Takim 2 adi
- Tur suresi
- Tur sayisi
- Pas limiti
- Oyunu baslat

### 9.4 Countdown

Amaç:
- oyuna gecis hissi vermek
- aktif takimi net gostermek
- 3-2-1 animasyonu ile turu baslatmak

### 9.5 Game Round ekrani

Ana bilesenler:
- ustte aktif takim
- buyuk timer
- ana kelime
- yasakli kelime listesi
- altta aksiyon butonlari:
  - Dogru
  - Pas
  - Tabu

Tasarim ilkeleri:
- tek elde kullanima uygun buyuk butonlar
- uzaktan gorulebilecek buyuk tipografi
- hata riskini azaltmak icin renk kodlama

### 9.6 Round Summary

Gosterilecek veriler:
- takim adi
- kazanilan puan
- dogru sayisi
- pas sayisi
- tabu sayisi
- toplam skor

### 9.7 Match Result

Gosterilecek veriler:
- final skor
- kazanan takim
- yeniden oyna
- ana menuye don

## 10. Klasorleme Onerisi

```text
src/
  app/
    (routes)
  components/
  features/
    game/
      components/
      hooks/
      state/
      domain/
      application/
      data/
    setup/
    stats/
    settings/
  shared/
    ui/
    utils/
    constants/
    storage/
  content/
    cards.tr.json
  tests/
```

Bu klasorleme, ozellik bazli ilerlemeyi kolaylastirir. Ileride online mod geldiginde `features/game` altina yeni adapter'lar eklenebilir.

## 11. Teknik Kararlar

### 11.1 Lokal veri secimi

Ilk surum icin:
- kartlar `JSON`
- ayarlar ve lokal istatistikler `AsyncStorage`

Eger kart sayisi buyurse:
- `SQLite`

### 11.2 State management

Oneri:
- global oyun akisi icin `Zustand`
- ekran icindeki gecici UI state'i component seviyesinde tut

### 11.3 Navigation

Oneri:
- `Expo Router`

Neden:
- modern Expo uyumu
- dosya tabanli routing
- basit proje yapisi

### 11.4 Analytics

Ilk surumde hafif analytics yeterli:
- kac oyun baslatildi
- kac oyun tamamlandi
- ortalama tur skoru
- en cok oynanan ayar kombinasyonu

Bu veri daha sonra retention kararlarinda kullanilir.

## 12. Test Stratejisi

### 12.1 Unit test

Test edilmesi gereken mantiklar:
- puan hesaplama
- tur bitis kosulu
- aktif takim degisimi
- toplam tur bitiminde mac sonu
- kart secimi ve tekrar kontrolu

### 12.2 Component test

Test edilmesi gereken ekranlar:
- setup form validation
- game round aksiyonlari
- round summary gosterimi
- result ekranindaki yeniden baslatma akisi

### 12.3 Manual QA checklist

- timer arka planda bozuluyor mu
- ekran kilitlenince state korunuyor mu
- tur sonunda yanlis takim aktif oluyor mu
- puanlar sifirlanmasi gereken yerde sifirlaniyor mu
- kartlar tekrarli gorunuyor mu
- uzun takim isimleri UI'i bozuyor mu

## 13. Gelistirme Fazlari

### Faz 0: Kesinlestirme

Sure:
- 1 gun

Cikti:
- oyun kurallari netlestirilir
- MVP kapsam dondurulur
- tasarim dili secilir

### Faz 1: Proje kurulumu

Sure:
- 1 gun

Isler:
- Expo projesi olusturma
- TypeScript setup
- navigation setup
- tema ve temel component altyapisi
- lint ve format araclari

### Faz 2: Domain ve oyun motoru

Sure:
- 2 ila 3 gun

Isler:
- entity modelleri
- game state store
- event/action mantigi
- puan hesaplama
- timer sistemi
- tur gecisleri

### Faz 3: Ekranlar ve UX

Sure:
- 3 ila 5 gun

Isler:
- home
- setup
- countdown
- gameplay
- round summary
- result
- rules
- settings

### Faz 4: Icerik entegrasyonu

Sure:
- 2 ila 4 gun

Isler:
- kart JSON yapisi
- kart yukleme
- shuffle mekanizmasi
- duplicate kontrolu
- ilk kart havuzunun entegrasyonu

### Faz 5: Test ve polish

Sure:
- 2 ila 4 gun

Isler:
- bug fix
- edge case temizligi
- performans kontrolu
- icon, splash, app metadata
- store screenshotlari

### Faz 6: Yayin

Sure:
- 2 ila 7 gun

Isler:
- iOS build
- Android build
- store listeleme metinleri
- privacy policy
- submission
- review duzeltmeleri

## 14. Takvim Tahmini

Kartlar hazirsa:
- gelistirme + polish: `1-2 hafta`
- store hazirligi ve yayin: `1 hafta`
- toplam: `2-3 hafta`

Kartlar da sifirdan uretilecekse:
- kart uretimi ve edit: `1-2 hafta`
- gelistirme + polish + yayin: `2-3 hafta`
- toplam: `3-5 hafta`

Bu tahmin:
- tek gelistirici
- AI destekli calisma
- klasik tabu kapsaminda kalinmasi
- online ozellik eklenmemesi

## 15. Store Hazirliklari

### 15.1 Zorunlu teslimatlar

- uygulama ikonu
- splash screen
- uygulama aciklamasi
- screenshot seti
- gizlilik politikasi sayfasi
- yas siniflandirma cevaplari

### 15.2 Marka ve lisans riskleri

Onemli notlar:
- uygulama adinda dogrudan `Tabu` veya `Taboo` kullanimi marka riski dogurabilir
- kulup logolari, lig logolari ve lisansli gorseller izinsiz kullanilmamali
- futbolcu isimleri metin olarak kullanilabilir; ancak gorsel ve marka varliklarinda dikkatli olunmali

Bu nedenle store markalamasinda daha ozgun bir isim tercih edilmelidir.

## 16. Gelecek Fazlar

Ilk surum basarili olursa su sira ile buyumek dogru olur:

1. Lokal istatistikler ve basari sistemi
2. Gunluk kart paketi
3. Tema ve zorluk modlari
4. Arkadasla oda sistemi
5. Online skor tabloları
6. Kullanici profili
7. Canli multiplayer

## 17. Basari Metrikleri

MVP sonrasi bakilacak temel metrikler:
- D1 retention
- bir oturumda oynanan ortalama mac sayisi
- tamamlanan oyun orani
- setup ekranindan oyun baslatma donusumu
- mac sonu yeniden oynama orani

Ilk hedef:
- yuksek retention degil, yuksek tamamlama orani ve tekrar oynama istegi

## 18. Definition of Done

Bir MVP surumu ancak su kosullarda tamamlanmis sayilir:

- iki takimla tam oyun akisi stabil calisiyor
- tum temel ayarlar aktif
- skorlar tutarli hesaplanıyor
- tur gecisleri hatasiz
- kart havuzu minimum kalite esigini geciyor
- uygulama offline calisiyor
- hem iOS hem Android build alinabiliyor
- store assetleri ve metinleri hazir

## 19. Son Tavsiye

Bu urun icin en dogru strateji kucuk ama cilali baslamaktir. Ilk surum:
- tek cihaz
- klasik tabu
- futbol temali kartlar
- cok temiz oyun dongusu

Bu cekirdek saglam kuruldugunda online mod, arkadas odalari ve buyuk oyun platformu vizyonu daha dusuk riskle insa edilir.
