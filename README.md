<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FFD700,50:FF6B9D,100:7C6CFF&height=230&section=header&text=%C3%87ekili%C5%9F%20Botu&fontSize=56&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Discord.js%20v14%20%7C%20Buton%20%2B%20Modal%20%7C%20SQLite%20%7C%20Sadece%20ayarlar.json&descAlignY=58&descSize=17" width="100%" />

<img src="https://readme-typing-svg.demolab.com?font=Sora&size=21&pause=1000&color=FFD700&center=true&vCenter=true&width=750&lines=%2Fcekilis+olu%C5%9Ftur+%E2%86%92+ba%C5%9Flat+%E2%86%92+kat%C4%B1l+%E2%86%92+kazan+%F0%9F%8E%89;21+alt+komut.+Gerekli+ko%C5%9Ful.+Bonus+entry.+S%C4%B1f%C4%B1r+.env.;Restart-safe+SQLite.+Tek+setTimeout.+S%C4%B1f%C4%B1r+dashboard." alt="typing-svg" />

<br/>

![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/better--sqlite3-restart--safe-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![No Dashboard](https://img.shields.io/badge/dashboard-YOK-EF4444?style=for-the-badge)
![License](https://img.shields.io/badge/Lisans-MIT-7C6CFF?style=for-the-badge)

**Tamamen komut + buton tabanlı, sıfır web arayüzlü, production seviyesinde bir çekiliş botu.**
Taslak oluştur, gözden geçir, başlat. Sonrası tamamen otomatik. 🎉

</div>

<br/>

## 📚 İçindekiler

- [🎬 Komutlar Aksiyonda](#-komutlar-aksiyonda)
- [✨ Neden Bu Bot?](#-neden-bu-bot)
- [🏗️ Mimari](#️-mimari)
- [⚡ Hızlı Başlangıç](#-hızlı-başlangıç)
- [⚙️ ayarlar.json — Satır Satır](#️-ayarlarjson--satır-satır)
- [🎮 Komut Referansı](#-komut-referansı)
- [⏱️ Süre Formatı](#️-süre-formatı)
- [🎯 Katılım Şartları & Bonus Entry](#-katılım-şartları--bonus-entry)
- [🔁 Yaşam Döngüsü](#-yaşam-döngüsü)
- [🛡️ Güvenlik & Anti-Abuse](#️-güvenlik--anti-abuse)
- [📂 Klasör Yapısı](#-klasör-yapısı)
- [❓ SSS](#-sss)

<br/>

## 🎬 Komutlar Aksiyonda

> 🎥 Aşağıdaki 9 kutu gerçek komut kullanım gif'leri için ayrılmış yer tutuculardır — ben binary video/gif üretemiyorum, ama sen 10-15 saniyelik ekran kayıtlarını [ScreenToGif](https://www.screentogif.com/) (Windows) ya da `Peek` / `Kap` (Linux) ile alıp `docs/gifs/` klasörüne bırakınca README otomatik olarak canlanacak. Dosya adları aşağıda hazır — birebir eşleştir, değiştirecek tek şey ekran kaydının kendisi.

<table>
<tr>
<td width="33%" align="center">

**1️⃣ Çekiliş Oluşturma**
`/cekilis olustur`
<br/><img src="./docs/gifs/01-olustur.gif" width="100%" alt="cekilis olustur" />

</td>
<td width="33%" align="center">

**2️⃣ Başlatma**
`/cekilis baslat`
<br/><img src="./docs/gifs/02-baslat.gif" width="100%" alt="cekilis baslat" />

</td>
<td width="33%" align="center">

**3️⃣ Katılma**
🎉 buton / `/cekilis katil`
<br/><img src="./docs/gifs/03-katil.gif" width="100%" alt="cekilis katil" />

</td>
</tr>
<tr>
<td width="33%" align="center">

**4️⃣ Katılımcılar**
👥 buton (sayfalama)
<br/><img src="./docs/gifs/04-katilimcilar.gif" width="100%" alt="cekilis katilimcilar" />

</td>
<td width="33%" align="center">

**5️⃣ Uzat / Kısalt**
`/cekilis uzat` · `kisalt`
<br/><img src="./docs/gifs/05-uzat-kisalt.gif" width="100%" alt="cekilis uzat kisalt" />

</td>
<td width="33%" align="center">

**6️⃣ Duraklat / Devam**
`/cekilis duraklat` · `devam`
<br/><img src="./docs/gifs/06-duraklat-devam.gif" width="100%" alt="cekilis duraklat devam" />

</td>
</tr>
<tr>
<td width="33%" align="center">

**7️⃣ Bitirme & Kazanan**
`/cekilis bitir`
<br/><img src="./docs/gifs/07-bitir.gif" width="100%" alt="cekilis bitir" />

</td>
<td width="33%" align="center">

**8️⃣ Yeniden Çekiliş**
`/cekilis yenidencek`
<br/><img src="./docs/gifs/08-yenidencek.gif" width="100%" alt="cekilis yenidencek" />

</td>
<td width="33%" align="center">

**9️⃣ Sıfırlama (Onaylı)**
`/cekilis sifirla`
<br/><img src="./docs/gifs/09-sifirla.gif" width="100%" alt="cekilis sifirla" />

</td>
</tr>
</table>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:151726,100:1B1E30&height=90&section=header&text=docs%2Fgifs%2F01-09%20%E2%80%94%20kendi%20kay%C4%B1tlar%C4%B1n%C4%B1%20buraya%20b%C4%B1rak%20%F0%9F%8E%AC&fontSize=16&fontColor=FFD700&fontAlign=50&fontAlignY=55" width="100%" />
</div>

<br/>

## ✨ Neden Bu Bot?

| | |
|---|---|
| 💾 **Restart-safe** | Bot yeniden başlasa da aktif çekilişler ve sayaçlar `SQLite`'tan geri yüklenir |
| ⏱️ **Akıllı zamanlama** | Her çekiliş için tek `setTimeout` + 60 saniyelik güvenlik taraması — saniye saniye tarama yok |
| 🎯 **Gerçek şartlar** | Hesap yaşı, üyelik süresi, gerekli/yasaklı rol, kanal erişimi — hepsi canlı kontrol ediliyor |
| 🎁 **Gerçek bonus entry** | Rol, mesaj sayısı, davet sayısı, üyelik süresi — hepsi veritabanına dayalı, sahte değil |
| 🔀 **İki adımlı akış** | `olustur` taslak oluşturur, `baslat` yayınlar — yayınlamadan önce gözden geçirme şansı |
| 🧾 **Log kanalı** | Her önemli olay (oluşturma, başlatma, bitirme, iptal, reroll) log kanalına düşer |

<br/>

## 🏗️ Mimari

```mermaid
flowchart LR
    User["Discord Kullanıcısı"] -->|"/cekilis ... veya buton"| Client["Discord Client (wnersdev.js)"]
    Client --> Router["interactionRouter / commands"]
    Router --> Logic["giveawayLogic · participationLogic"]
    Logic --> Engine["requirementEngine\n(şart + bonus hesaplama)"]
    Logic --> Scheduler["giveawayScheduler\n(setTimeout + güvenlik taraması)"]
    Logic --> DB[("SQLite\ngiveaways.sqlite")]
    Engine --> Stats[("message_stats\ninvite_stats")]
    Client -->|guildMemberAdd / messageCreate| Stats
    Scheduler -->|"süre bitti"| Logic
    Logic -->|embed güncelle + kazanan anonsu| User
    Logic -->|log| LogChannel["Log Kanalı"]
```

<br/>

## ⚡ Hızlı Başlangıç

```bash
# 1. Bağımlılıkları kur
npm install

# 2. ayarlar.json'u doldur (token, clientId, guildId...)

# 3. Slash komutlarını yayınla
npm run deploy-commands

# 4. Başlat 🎉
npm start
```

> 💡 `guildId` boş bırakılırsa komutlar **global** kaydedilir (yayılması saatler sürebilir). Test ederken `guildId` girmen çok daha hızlı olur.

### Discord Developer Portal

1. [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**
2. **Bot** → token al → `ayarlar.json → token`
3. **Bot → Privileged Gateway Intents** → **SERVER MEMBERS INTENT**'i aç ⚠️ *(üyelik/davet bonusları bunsuz çalışmaz)*
4. **OAuth2 → General** → Client ID → `ayarlar.json → clientId`
5. Botu davet ederken izinler: `Send Messages`, `Embed Links`, `Read Message History`, `Use Slash Commands`, `Manage Messages`

<br/>

## ⚙️ ayarlar.json — Satır Satır

```jsonc
{
  "token": "",              // Discord bot token'ı — başka hiçbir dosyada bulunmaz
  "clientId": "",           // Uygulama ID
  "guildId": "",            // Boşsa global, doluysa tek sunucu
  "logChannelId": "",       // Olay logları buraya düşer
  "colors": { "success": "#2DD4BF", "error": "#EF4444", "info": "#7C6CFF", "warning": "#F5A623" },
  "giveaway": {
    "defaultWinners": 1,        // /cekilis olustur'da kazanan_sayisi verilmezse
    "maxWinners": 50,           // İzin verilen maksimum kazanan
    "allowCreatorJoin": false,  // Sahibi varsayılan olarak katılamaz
    "adminPermission": "ManageGuild" // Yönetici alt komutları için gereken izin
  },
  "bonusEntries": {
    "roles": [ { "roleId": "123...", "entries": 2 } ],
    "messageBonus": { "enabled": false, "messagesRequired": 100, "entries": 2, "cooldownSeconds": 30 },
    "inviteBonus": { "enabled": false, "invitesRequired": 3, "entries": 3 },
    "membershipBonus": { "enabled": false, "days": 30, "entries": 1 }
  },
  "requirementDefaults": { "minAccountAgeDays": 0, "minMembershipDays": 0 },
  "database": { "path": "./data/giveaways.sqlite" },
  "scheduler": { "safetySweepSeconds": 60 }
}
```

<br/>

## 🎮 Komut Referansı

<details open>
<summary><b>👑 Yönetici Komutları</b> (varsayılan: <code>ManageGuild</code> izni)</summary>

| Komut | Ne yapar |
|---|---|
| `/cekilis olustur` | Ödül, süre, kazanan sayısı, şartlar ve bonusları belirleyip **taslak** oluşturur (henüz yayınlanmaz) |
| `/cekilis baslat id:` | Taslağı ilgili kanala gönderir, sayacı başlatır |
| `/cekilis bitir id:` | Aktif/duraklatılmış çekilişi hemen sonlandırır, kazananı seçer |
| `/cekilis iptal id:` | Kazanan seçmeden çekilişi iptal eder |
| `/cekilis yenidencek id:` | Yeni kazanan seçer — `eskilerdahil:true` ile eski kazananlar da havuza girer |
| `/cekilis duzenle id:` | Ödül, kazanan sayısı, gerekli/yasaklı rolleri günceller |
| `/cekilis uzat id: sure:` / `kisalt id: sure:` | Süreyi anlık olarak uzatır/kısaltır, zamanlayıcı yeniden kurulur |
| `/cekilis duraklat id:` / `devam id:` | Sayaç donar/devam eder, `katilimi_kapat` ile katılım da kapatılabilir |
| `/cekilis temizle id:` | Aktif olmayan bir çekiliş kaydını veritabanından siler |
| `/cekilis sifirla` | Sunucudaki tüm geçmişi siler — **onay butonlu**, aktif çekilişler dokunulmaz |
| `/cekilis kopyala id:` | Var olan bir çekilişi yeni taslak olarak çoğaltır |

</details>

<details open>
<summary><b>🙋 Herkesin Kullanabildiği Komutlar</b></summary>

| Komut | Ne yapar |
|---|---|
| `/cekilis katil id:` / `cik id:` | Katılır / ayrılır (şartlar otomatik kontrol edilir) |
| `/cekilis bilgi id:` | Ödül, süre, kazanan sayısı, şartlar, sahip, katılımcı sayısı |
| `/cekilis sartlar id:` | Sadece katılım şartlarını gösterir |
| `/cekilis kazananlar id:` | Sona ermiş bir çekilişin kazananları |
| `/cekilis katilimcilar id:` | Herkese sayı, yetkiliye sayfalanmış tam liste |
| `/cekilis liste durum:` | Sunucudaki çekilişleri duruma göre listeler |
| `/cekilis gecmis kullanici:` | Geçmiş çekilişleri (opsiyonel kullanıcı filtresiyle) gösterir |

</details>

Çekiliş mesajındaki **🎉 Katıl · 👥 Katılımcılar · ℹ️ Bilgi** butonları aynı mantığı kullanır — komut yazmaya gerek yok.

<br/>

## ⏱️ Süre Formatı

| Kısa | Okunabilir |
|---|---|
| `10s`, `30s` | `30 saniye` |
| `1m`, `10m` | `10 dakika` |
| `1h`, `6h` | `6 saat` |
| `1d`, `3d` | `3 gün` |
| `1w` | `1 hafta` |
| — | `1 saat 30 dakika`, `2 gün 4 saat` gibi birleşik ifadeler de desteklenir |

<br/>

## 🎯 Katılım Şartları & Bonus Entry

```mermaid
flowchart TD
    A["Kullanıcı Katıl'a basar"] --> B{"Bot mu?"}
    B -->|Evet| X["❌ Reddedildi"]
    B -->|Hayır| C{"Zaten katıldı mı?"}
    C -->|Evet| X2["❌ Zaten katıldın"]
    C -->|Hayır| D{"Hesap yaşı / üyelik\nsüresi yeterli mi?"}
    D -->|Hayır| X3["❌ Neden belirtilir"]
    D -->|Evet| E{"Gerekli rol var mı /\nyasaklı rol var mı?"}
    E -->|Uygun değil| X4["❌ Neden belirtilir"]
    E -->|Uygun| F["✅ Katılım kaydedilir"]
    F --> G["Bonus entry hesaplanır\n(rol + mesaj + davet + üyelik)"]
    G --> H["Toplam giriş hakkı kaydedilir"]
```

<br/>

## 🔁 Yaşam Döngüsü

```
draft ──baslat──▶ active ──duraklat──▶ paused ──devam──▶ active
  │                  │                                     │
  │               bitir/süre dolar                     bitir
  ▼                  ▼                                     ▼
(kopyala)          ended ◀──────────── yenidencek ─────────┘
                     │
                  temizle / sifirla ──▶ (kayıt silinir)

herhangi bir aşamada → iptal ──▶ cancelled
```

<br/>

## 🛡️ Güvenlik & Anti-Abuse

- ✅ Bot hesapları otomatik reddedilir
- ✅ Aynı kullanıcı bir çekilişe iki kez giremez
- ✅ Tüm yönetici alt komutlarında izin kontrolü (`ManageGuild` varsayılan, `ayarlar.json`'dan değiştirilebilir)
- ✅ SQLite parametreli sorgular — enjeksiyon riski yok
- ✅ Kazanan seçimi ve süre değişiklikleri tek zamanlayıcı üzerinden yönetilir — çakışan bitirme riski azaltılmıştır
- ✅ Hatalar kullanıcıya asla stack trace olarak gösterilmez, log kanalına düşer
- ✅ Sıfırlama gibi geri alınamaz işlemler onay butonu ister

<br/>

## 📂 Klasör Yapısı

```text
wnersdev.js               🚪 Ana giriş dosyası
ayarlar.json              ⚙️ Tüm yapılandırma

commands/cekilis.js        💬 21 alt komut

events/
├── ready.js                📡 Cache + zamanlayıcı yükleme
├── interactionCreate.js     🎯 Komut/buton yönlendirme
├── guildMemberAdd.js        📥 Davet bonusu tespiti
├── messageCreate.js         💬 Mesaj bonusu sayacı
├── inviteCreate.js / inviteDelete.js  🔗 Davet cache güncelleme

handlers/
├── giveawayLogic.js         🎁 Oluştur/başlat/bitir/iptal/reroll/pause/resume/extend
├── giveawayScheduler.js     ⏰ setTimeout + güvenlik taraması
├── giveawayView.js          🖼️ Embed + buton üretimi
├── participationLogic.js    🙋 Katılma/çıkma
├── participantsView.js      👥 Sayfalanmış katılımcı listesi
├── requirementEngine.js     🎯 Şart + bonus hesaplama
├── interactionRouter.js     🔀 Buton yönlendirme
└── inviteTracker.js          🔗 Davet cache karşılaştırma

database/
├── db.js                   💾 SQLite şema
├── giveawayRepository.js    📦 Çekiliş CRUD
└── statsRepository.js       📊 Mesaj/davet sayaçları

utils/  config · duration · embeds · permissions · idGenerator · snowflake · logger
```

<br/>

## ❓ SSS

<details>
<summary><b>Neden "oluştur" ve "başlat" ayrı komutlar?</b></summary>
<br/>
Böylece ödülü, süreyi ve şartları yazdıktan sonra yayınlamadan önce <code>/cekilis bilgi</code> ile kontrol edebilirsin. Hata yaptıysan <code>duzenle</code> ile düzeltip öyle <code>baslat</code> dersin.
</details>

<details>
<summary><b>Bot çökerse veya yeniden başlarsa çekilişler kaybolur mu?</b></summary>
<br/>
Hayır. Tüm çekiliş verisi SQLite'a yazılır. Açılışta <code>ready.js</code>, aktif/duraklatılmış tüm çekilişleri okuyup zamanlayıcıları yeniden kurar; süresi çoktan dolmuş olanları da anında sonlandırır.
</details>

<details>
<summary><b>Davet bonusu neden çalışmıyor?</b></summary>
<br/>
İki şey gerekli: Developer Portal'da <b>SERVER MEMBERS INTENT</b>'in açık olması ve <code>ayarlar.json → bonusEntries.inviteBonus.enabled</code>'ın <code>true</code> olması.
</details>

<br/>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7C6CFF,50:FF6B9D,100:FFD700&height=140&section=footer" width="100%" />

<img src="https://readme-typing-svg.demolab.com?font=Sora&size=26&pause=1200&color=FFD700&center=true&vCenter=true&width=500&lines=%E2%9A%A1+Powered+By+WnersDev+%E2%9A%A1" alt="powered-by" />

![Made with](https://img.shields.io/badge/yapıldı-%E2%9D%A4%EF%B8%8F%20ile-FF6B9D?style=for-the-badge)
![Powered](https://img.shields.io/badge/Powered%20By-WnersDev-FFD700?style=for-the-badge&labelColor=151726)

</div>
