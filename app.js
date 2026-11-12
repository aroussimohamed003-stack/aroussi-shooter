/* ===================================================================
   SHOOTER AROUSSI - OFFICIAL GAME WEBSITE INTERACTIVE SCRIPT
   Interactive Engine, Canvas Particles, Web Audio Synth, Download Hub
   =================================================================== */

// MediaFire Direct Download URLs (single official mirror)
const DEFAULT_DOWNLOADS = {
  android: {
    mediafire: 'https://www.mediafire.com/file/tacw03df4i5l60g/shooter_aroussi.apk/file'
  },
  pc: {
    mediafire: 'https://www.mediafire.com/file/h4334sy5oxajup8/sooter_aroussi.rar/file'
  }
};

// State Store
let appState = {
  currentLang: 'ar',
  soundEnabled: true,
  downloadLinks: { android: DEFAULT_DOWNLOADS.android, pc: DEFAULT_DOWNLOADS.pc }
};

/* ===================================================================
   1. WEB AUDIO SYNTHESIZER (No External Sound Files Required)
   =================================================================== */
class TacticalAudioSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  // Futuristic UI Hover Beep
  playHover() {
    if (!appState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Tactical Button Click
  playClick() {
    if (!appState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // Download Trigger Fanfare
  playDownload() {
    if (!appState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [330, 440, 554, 659].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.06, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } catch (e) {}
  }
}

const audioSynth = new TacticalAudioSynth();

/* ===================================================================
   2. AMBIENT BATTLEFIELD EMBER PARTICLES CANVAS
   =================================================================== */
function initEmberParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const emberCount = 45;
  const embers = [];

  for (let i = 0; i < emberCount; i++) {
    embers.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 0.8,
      speedY: -(Math.random() * 1.4 + 0.4),
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.4 ? '#ff5722' : '#ffb300'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.y += e.speedY;
      e.x += e.speedX + Math.sin(e.y * 0.02) * 0.3;

      if (e.y < -10) {
        e.y = height + 10;
        e.x = Math.random() * width;
      }

      ctx.save();
      ctx.globalAlpha = e.opacity;
      ctx.fillStyle = e.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ===================================================================
   3. DOWNLOAD MODAL & PROGRESS CONTROLLER
   =================================================================== */
let downloadInterval = null;

function openDownloadModal(platform) {
  audioSynth.playClick();
  const modal = document.getElementById('download-modal');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const iconBadge = document.getElementById('modal-platform-icon');
  const directBtn = document.getElementById('modal-direct-btn');
  const progressFill = document.getElementById('modal-progress-fill');
  const percentText = document.getElementById('modal-percent-text');
  const statusText = document.getElementById('modal-status-text');

  const links = DEFAULT_DOWNLOADS[platform];

  // Set Modal Appearance based on platform
  if (platform === 'android') {
    iconBadge.className = 'modal-icon-badge';
    iconBadge.innerHTML = '<i class="fa-brands fa-android"></i>';
    title.textContent = appState.currentLang === 'ar' ? 'بدء تحميل نسخة الأندرويد APK' : 'Starting Android APK Download';
    subtitle.textContent = 'Shooter_Aroussi_v1.0.apk • 222 MB';
  } else {
    iconBadge.className = 'modal-icon-badge pc-blue';
    iconBadge.innerHTML = '<i class="fa-brands fa-windows"></i>';
    title.textContent = appState.currentLang === 'ar' ? 'بدء تحميل نسخة الكمبيوتر PC' : 'Starting PC Windows Download';
    subtitle.textContent = 'Shooter_Aroussi_PC_v1.0.zip • 245 MB';
  }

  // Set Action Link (MediaFire only)
  directBtn.href = links.mediafire;
  directBtn.removeAttribute('download');

  // Open Modal
  modal.classList.add('active');

  // Reset Progress
  progressFill.style.width = '0%';
  percentText.textContent = '0%';
  statusText.textContent = appState.currentLang === 'ar' ? 'جاري تجهيز رابط التحميل...' : 'Preparing download link...';

  // Animate progress simulation and trigger download
  let progress = 0;
  if (downloadInterval) clearInterval(downloadInterval);

  downloadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(downloadInterval);
      progressFill.style.width = '100%';
      percentText.textContent = '100%';
      statusText.textContent = appState.currentLang === 'ar' ? 'بدأ التحميل بنجاح!' : 'Download started successfully!';
      audioSynth.playDownload();

      // Trigger download from MediaFire
      setTimeout(() => {
        window.open(links.mediafire, '_blank');
      }, 500);
    } else {
      progressFill.style.width = progress + '%';
      percentText.textContent = progress + '%';
      if (progress > 50) {
        statusText.textContent = appState.currentLang === 'ar' ? 'جاري تجهيز الملف...' : 'Preparing file...';
      }
    }
  }, 120);
}

function closeDownloadModal() {
  audioSynth.playClick();
  const modal = document.getElementById('download-modal');
  modal.classList.remove('active');
  if (downloadInterval) clearInterval(downloadInterval);
}

// Close Modal on backdrop click or Escape key
document.getElementById('download-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'download-modal') closeDownloadModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDownloadModal();
    closeLinkConfigModal();
  }
});

/* ===================================================================
   4. QR CODE & SHARE LINK GENERATOR (MediaFire only)
   =================================================================== */
let androidQrRendered = false;

function toggleQRCode(platform) {
  audioSynth.playClick();
  if (platform === 'android') {
    const box = document.getElementById('android-qr-box');
    if (!box) return;
    const isHidden = box.style.display === 'none';
    box.style.display = isHidden ? 'block' : 'none';

    if (isHidden && !androidQrRendered && window.QRCode) {
      const currentUrl = window.location.href.split('#')[0];
      const dlUrl = currentUrl + (currentUrl.endsWith('/') ? '' : '/') + DEFAULT_DOWNLOADS.android.mediafire;
      new QRCode(document.getElementById('android-qrcode'), {
        text: dlUrl,
        width: 140,
        height: 140,
        colorDark: '#0a0d14',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      androidQrRendered = true;
    }
  } else if (platform === 'pc') {
    const box = document.getElementById('pc-qr-box');
    const input = document.getElementById('pc-share-url');
    if (!box || !input) return;
    const isHidden = box.style.display === 'none';
    box.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
      const currentUrl = window.location.href.split('#')[0];
      input.value = currentUrl + (currentUrl.endsWith('/') ? '' : '/') + DEFAULT_DOWNLOADS.pc.mediafire;
    }
  }
}

function copyShareLink(platform) {
  audioSynth.playClick();
  const input = document.getElementById('pc-share-url');
  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
      showToast(appState.currentLang === 'ar' ? 'تم نسخ رابط التحميل بنجاح!' : 'Download link copied to clipboard!');
    });
  }
}

/* ===================================================================
   5. CUSTOM CLOUD LINKS MANAGER — REMOVED (MediaFire-only now)
   =================================================================== */

/* ===================================================================
   6. WEAPONS CATEGORY TABS
   =================================================================== */
function initWeaponTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.weapon-card');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      audioSynth.playClick();
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      cards.forEach((card) => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ===================================================================
   7. BILINGUAL TRANSLATION SYSTEM (ARABIC / ENGLISH)
   =================================================================== */
const I18N_DATA = {
  ar: {
    top_season: 'الموسم الأول: فجر البقاء (SURVIVOR\'S DAWN) متاح الآن!',
    server_status: 'السيرفرات تعمل بكفاءة عالية 100% | بنغ منخفض',
    nav_home: '<i class="fa-solid fa-house"></i> الرئيسية',
    nav_features: '<i class="fa-solid fa-shield-halved"></i> المميزات',
    nav_weapons: '<i class="fa-solid fa-gun"></i> الأسلحة',
    nav_maps: '<i class="fa-solid fa-map-location-dot"></i> الخرائط',
    nav_download: '<i class="fa-solid fa-download"></i> التحميل',
    nav_specs: '<i class="fa-solid fa-microchip"></i> متطلبات التشغيل',
    cta_download: 'تحميل اللعبة',
    hero_tag: 'أقوى تجربة باتل رويال مستوحاة من فري فاير وببجي',
    hero_sub_badge: 'معركة البقاء الأخيرة',
    hero_desc: 'اهبط بالمظلة في قلب الجزيرة المحروقة، اجمع أفتك الأسلحة والمعدات التكتيكية، قُد المركبات القتالية، وتغلب على 99 مقاتلاً لتكون الناجي الأخير! تجربة لعب أصيلة وواقعية بالكامل للكمبيوتر والهاتف.',
    card_android_sub: 'نسخة الأندرويد الرسمية',
    card_pc_sub: 'نسخة الكمبيوتر بدون محاكي',
    stat_players: 'مقاتل في كل جولة',
    stat_fps: 'أداء سلس بدون لاق',
    stat_weapons: 'سلاح ومركبة قتالية',
    stat_free: 'مجانية بالكامل للجميع',
    scroll_more: 'استكشف المعركة',
    features_tag: 'مميزات أسطورية',
    features_title: 'لماذا تختار <span class="text-gradient">شوتر العروسي</span>؟',
    features_desc: 'دمجنا بين سرعة وحماس مواجهات فري فاير مع فيزياء وتكتيكات ببجي موبايل لنقدم لك أفضل تجربة باتل رويال متكاملة.',
    feat_1_title: 'نزول تكتيكي و100 لاعب',
    feat_1_text: 'اهبط في أي نقطة تختارها على الجزيرة، سارع بالبحث عن عتادك، تجنب منطقة الخطر (Red Zone)، وحافظ على موقعك داخل دائرة الأمان الزاحفة.',
    feat_2_title: 'فيزياء أسلحة بالستية واقعية',
    feat_2_text: 'حساب دقيق لسرعة الرصاص والجاذبية والارتداد، مع دعم كامل للسكوبات المتنوعة (2x, 4x, 8x) وكواتم الصوت ومخازن الذخيرة الموسعة.',
    feat_3_title: 'نسخة كمبيوتر أصلية بدون محاكي',
    feat_3_text: 'وداعاً لمشاكل المحاكيات الثقيلة! تم تطوير نسخة الـ PC خصيصاً بنظام Native مع تحكم ماوس ولوحة مفاتيح سلس وسريع الاستجابة.',
    feat_4_title: 'مركبات قتالية ومطاردات شرسة',
    feat_4_text: 'قُد الجيب العسكري والباجي والدراجات النارية للتحرك السريع وقطع المسافات ومباغتة الخصوم أو دهسهم في المعارك المفتوحة.',
    feat_5_title: 'تحسين خارق للأجهزة الضعيفة',
    feat_5_text: 'محرك اللعبة تم تصميمه ليعمل بسلاسة 60 إطار في الثانية حتى على الهواتف وأجهزة الكمبيوتر الاقتصادية مع الحفاظ على وضوح الرسوم.',
    feat_6_title: 'إنزال جوي مميز (Airdrop Crates)',
    feat_6_text: 'ترقب دخان الإنزال الجوي الأحمر للحصول على أندر الأسلحة والخوذات والمدرعات من المستوى الثالث، لكن احذر من كمائن القناصة!',
    action_tag: 'القتال لا يتوقف',
    action_title: 'هل تمتلك الشجاعة لتكون الناجي الأخير؟',
    action_desc: 'انضم لآلاف اللاعبين الذين يتنافسون يومياً على نيل لقب "بطل الجزيرة". جهز أسلحتك وابدأ معركتك الآن مجاناً!',
    btn_enter_battle: 'ادخل ساحة المعركة الآن',
    weapons_tag: 'ترسانة المعركة',
    weapons_title: 'الأسلحة والعتاد <span class="text-gradient">التكتيكي</span>',
    weapons_desc: 'اختر سلاحك المفضل حسب أسلوب لعبك؛ سواء كنت تفضل الاشتباكات القريبة السريعة أو القنص الدقيق من مسافات بعيدة.',
    tab_ar: 'بنادق هجومية (AR)',
    tab_sniper: 'قناصات (Sniper)',
    tab_smg: 'رشاشات خفيفة (SMG)',
    tab_crate: 'أسلحة الإنزال (Crate)',
    dl_tag: '🚀 مركز التحميل المباشر',
    dl_title: 'حمّل <span class="text-gradient">شوتر العروسي</span> لجهازك الآن',
    dl_desc: 'اختر نسختك المفضلة؛ نسخة الأندرويد للهواتف الذكية أو نسخة الكمبيوتر الأصلية (Native Windows) بروابط مباشرة وسريعة مجاناً 100%.',
    dl_android_head: 'نسخة الأندرويد الرسمية',
    dl_pc_head: 'نسخة الكمبيوتر الرسمية',
    btn_dl_now: 'تحميل مباشر الآن',
    btn_dl_now_pc: 'تحميل للكمبيوتر مباشر',
    guide_android_title: 'طريقة تثبيت اللعبة على هاتف الأندرويد؟',
    guide_pc_title: 'طريقة تشغيل اللعبة على الكمبيوتر؟',
    specs_tag: 'المواصفات التقنية',
    specs_title: 'متطلبات تشغيل <span class="text-gradient">اللعبة</span>',
    specs_desc: 'تم تحسين شوتر العروسي لتعمل بأفضل أداء على كافة الأجهزة المتوسطة والحديثة.',
    faq_tag: 'الأسئلة الأكثر شيوعاً',
    faq_title: 'كل ما تريد معرفته عن <span class="text-gradient">شوتر العروسي</span>',
    admin_tip_title: 'هل ترغب بتحديث روابط التحميل السحابية؟',
    admin_tip_desc: 'يمكنك بسهولة تخصيص روابط Google Drive أو MediaFire لنسختي الأندرويد والكمبيوتر في أي وقت بنقرة واحدة.',
    btn_edit_links: 'تعديل الروابط السحابية'
  },
  en: {
    top_season: 'SEASON 1: SURVIVOR\'S DAWN IS NOW LIVE!',
    server_status: 'Servers Online 100% | Low Ping Active',
    nav_home: '<i class="fa-solid fa-house"></i> Home',
    nav_features: '<i class="fa-solid fa-shield-halved"></i> Features',
    nav_weapons: '<i class="fa-solid fa-gun"></i> Weapons',
    nav_maps: '<i class="fa-solid fa-map-location-dot"></i> Maps',
    nav_download: '<i class="fa-solid fa-download"></i> Download',
    nav_specs: '<i class="fa-solid fa-microchip"></i> System Specs',
    cta_download: 'Download Game',
    hero_tag: 'INTENSE BATTLE ROYALE INSPIRED BY FREE FIRE & PUBG',
    hero_sub_badge: 'THE ULTIMATE SURVIVAL WARFARE',
    hero_desc: 'Parachute onto the scorched battleground island, loot deadly tactical weapons, drive armored war vehicles, and defeat 99 players to be the lone survivor! Full authentic experience for PC and Mobile.',
    card_android_sub: 'Official Android Edition',
    card_pc_sub: 'Native PC Without Emulator',
    stat_players: 'Players per Match',
    stat_fps: 'Smooth High FPS',
    stat_weapons: 'Weapons & Vehicles',
    stat_free: '100% Free Forever',
    scroll_more: 'Explore Battlefield',
    features_tag: 'LEGENDARY FEATURES',
    features_title: 'Why Choose <span class="text-gradient">Shooter Aroussi</span>?',
    features_desc: 'We blended the adrenaline and speed of Free Fire with the tactical ballistics of PUBG Mobile for the ultimate survival experience.',
    feat_1_title: '100-Player Tactical Drop',
    feat_1_text: 'Choose your drop zone on the vast island, scramble for high-tier loot, dodge hazardous red zones, and outsmart the shrinking play circle.',
    feat_2_title: 'Realistic Weapon Ballistics',
    feat_2_text: 'Authentic bullet velocity, gravity drop, and recoil control. Full attachment support for scopes (2x, 4x, 8x), suppressors, and magazines.',
    feat_3_title: 'Native PC Build (No Emulator)',
    feat_3_text: 'Say goodbye to sluggish emulators! Our PC build runs natively on Windows with ultra-responsive keyboard and mouse mechanics.',
    feat_4_title: 'Combat Vehicles & Pursuits',
    feat_4_text: 'Drive military buggies, motorbikes, and armored transports to cover distances swiftly and ambush enemy positions.',
    feat_5_title: 'Optimized for Budget Hardware',
    feat_5_text: 'Custom tuned game engine ensures smooth 60 FPS gameplay on budget smartphones and entry-level PC rigs without compromising clarity.',
    feat_6_title: 'Airdrop Supply Crates',
    feat_6_text: 'Watch for the crimson flare smoke delivering high-tier level 3 military vests, helmets, and rare one-shot sniper rifles.',
    action_tag: 'NON-STOP WARFARE',
    action_title: 'Do You Have What It Takes to Be The Survivor?',
    action_desc: 'Join thousands of fighters clashing daily for the title of Island Champion. Gear up and drop into battle today!',
    btn_enter_battle: 'Enter The Battlezone Now',
    weapons_tag: 'ARSENAL SHOWCASE',
    weapons_title: 'Weapons & <span class="text-gradient">Tactical Gear</span>',
    weapons_desc: 'Choose your loadout tailored to your combat style: from aggressive close-quarters clearing to silent long-range sniper takedowns.',
    tab_ar: 'Assault Rifles (AR)',
    tab_sniper: 'Snipers',
    tab_smg: 'SMGs',
    tab_crate: 'Airdrop Crates',
    dl_tag: '🚀 DIRECT DOWNLOAD HUB',
    dl_title: 'Download <span class="text-gradient">Shooter Aroussi</span> Now',
    dl_desc: 'Choose your desired platform: Mobile Android APK or Native Windows PC ZIP package with high-speed direct links.',
    dl_android_head: 'Official Android Edition',
    dl_pc_head: 'Official PC Edition',
    btn_dl_now: 'Download via MediaFire',
    btn_dl_now_pc: 'Download via MediaFire',
    guide_android_title: 'How to install on Android phone?',
    guide_pc_title: 'How to play on PC?',
    specs_tag: 'HARDWARE SPECS',
    specs_title: 'System <span class="text-gradient">Requirements</span>',
    specs_desc: 'Shooter Aroussi is thoroughly tuned to run effortlessly on both modern and budget setups.',
    faq_tag: 'FREQUENTLY ASKED QUESTIONS',
    faq_title: 'Everything You Need to Know About <span class="text-gradient">Shooter Aroussi</span>',
    admin_tip_title: 'Want to update your cloud download links?',
    admin_tip_desc: 'Easily set custom Google Drive or MediaFire mirror links for Android and PC at any time with one click.',
    btn_edit_links: 'Edit Cloud Mirrors'
  }
};

function toggleLanguage() {
  audioSynth.playClick();
  appState.currentLang = appState.currentLang === 'ar' ? 'en' : 'ar';

  document.documentElement.lang = appState.currentLang;
  document.documentElement.dir = appState.currentLang === 'ar' ? 'rtl' : 'ltr';

  const label = document.getElementById('lang-label');
  if (label) label.textContent = appState.currentLang === 'ar' ? 'EN' : 'عربي';

  const dict = I18N_DATA[appState.currentLang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });
}

/* ===================================================================
   8. AUDIO & SOUND TOGGLE
   =================================================================== */
function toggleSound() {
  appState.soundEnabled = !appState.soundEnabled;
  const btn = document.getElementById('audio-toggle');
  const icon = document.getElementById('audio-icon');

  if (appState.soundEnabled) {
    btn.classList.remove('muted');
    icon.className = 'fa-solid fa-volume-high';
    audioSynth.playClick();
    showToast(appState.currentLang === 'ar' ? 'تم تفعيل المؤثرات الصوتية' : 'Sound Effects Enabled');
  } else {
    btn.classList.add('muted');
    icon.className = 'fa-solid fa-volume-xmark';
    showToast(appState.currentLang === 'ar' ? 'تم كتم المؤثرات الصوتية' : 'Sound Effects Muted');
  }
}

/* ===================================================================
   9. TOAST NOTIFICATIONS HELPER
   =================================================================== */
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(18, 24, 38, 0.95);
      border: 1px solid #ff5722;
      color: #fff;
      padding: 0.75rem 1.75rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.9rem;
      z-index: 9999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,87,34,0.4);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      backdrop-filter: blur(12px);
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #00e676;"></i> <span>${message}</span>`;
  toast.style.transform = 'translateX(-50%) translateY(0)';

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 2800);
}

/* ===================================================================
   10. MOBILE MENU & HEADER SCROLL CONTROLS
   =================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Header Scroll Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  toggle?.addEventListener('click', () => {
    audioSynth.playClick();
    navMenu.classList.toggle('active');
  });

  // Close mobile menu on link click
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      audioSynth.playHover();
      navMenu.classList.remove('active');
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Add Sound Hover to Interactive Elements
  document.querySelectorAll('button, .btn, .hero-dl-card, .tab-btn').forEach((elem) => {
    elem.addEventListener('mouseenter', () => {
      audioSynth.playHover();
    });
  });
}

/* ===================================================================
   11. INITIALIZATION ON DOM READY
   =================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initEmberParticles();
  initWeaponTabs();
  initNavigation();

  document.getElementById('lang-toggle')?.addEventListener('click', toggleLanguage);
  document.getElementById('audio-toggle')?.addEventListener('click', toggleSound);

  console.log('🔥 Shooter Aroussi Website Engine Initialized Successfully!');
});
