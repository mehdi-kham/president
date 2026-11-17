/*
 * Contenu narratif du jeu.
 *
 * Effets d'un choix (objet `fx`) :
 *   sond / treso / coh / cred  -> jauges visibles (Sondages, Trésorerie, Cohésion, Crédibilité)
 *   integ                      -> intégrité (cachée, départ 70)
 *   dette                      -> dettes envers des lobbys / puissants (cachée)
 *   scand                      -> risque de scandale (caché)
 *   parr                       -> parrainages
 *
 * Placeholders dans les textes : {nom} {titre} {cand} {e} {parti} {parr} {lepres} {il}
 */

const ARCHETYPES = {
  heritier: {
    id: "heritier",
    name: "L’Héritier", nameF: "L’Héritière",
    tag: "Majorité sortante",
    emoji: "🏛️",
    party: "L’Élan Républicain",
    plus: "Caisse de campagne pleine, soutien institutionnel",
    minus: "Usure du pouvoir, fort rejet populaire",
    challenge: "Se détacher du bilan du président sortant sans perdre son socle.",
    stats: { sondages: 42, tresorerie: 80, cohesion: 62, credibilite: 65 },
    parrainages: 380,
    mods: { sondages: { pos: 0.85 }, tresorerie: { neg: 0.8 } },
    modsDesc: ["Gains de sondages réduits (usure du pouvoir)", "Pertes financières amorties"]
  },
  tribun: {
    id: "tribun",
    name: "Le Tribun", nameF: "La Tribune",
    tag: "Gauche radicale",
    emoji: "✊",
    party: "L’Union Populaire",
    plus: "Toute la jeunesse derrière lui : lycéens, étudiants, jeunes actifs, meetings géants",
    minus: "Clivant, ton jugé agressif, rejet des milieux économiques",
    challenge: "Transformer la ferveur de la jeunesse en bulletins sans effrayer les modérés.",
    stats: { sondages: 54, tresorerie: 45, cohesion: 64, credibilite: 40 },
    parrainages: 370,
    mods: { sondages: { pos: 1.2 }, credibilite: { neg: 1.25 } },
    modsDesc: ["Gains de sondages amplifiés (vague jeune)", "Pertes de crédibilité amplifiées"]
  },
  patriote: {
    id: "patriote",
    name: "Le Patriote", nameF: "La Patriote",
    tag: "Droite nationale",
    emoji: "🦅",
    party: "Le Peuple Debout",
    plus: "Électorat fidèle et motivé, très fort dans la France rurale et périurbaine",
    minus: "Dérapages racistes à répétition dans le mouvement, plafond de verre",
    challenge: "Dédiaboliser le mouvement sans perdre la base historique.",
    stats: { sondages: 60, tresorerie: 40, cohesion: 58, credibilite: 34 },
    parrainages: 330,
    scandale: 15,
    round2: -4,
    mods: { credibilite: { neg: 1.3 } },
    modsDesc: ["Pertes de crédibilité amplifiées", "Malus au second tour (front républicain)", "Casseroles : risque de scandale de départ"]
  },
  ecolo: {
    id: "ecolo",
    name: "L’Écologiste", nameF: "L’Écologiste",
    tag: "Écologie politique",
    emoji: "🌱",
    party: "Terre Commune",
    plus: "Réseau dense d’élus locaux, militants passionnés, image intègre",
    minus: "Courants internes qui s’entre-déchirent, procès en « écologie punitive »",
    challenge: "Parler aux classes populaires et rurales sans renier l’urgence climatique.",
    stats: { sondages: 42, tresorerie: 42, cohesion: 42, credibilite: 54 },
    parrainages: 430,
    integ: 80,
    mods: { cohesion: { neg: 1.35 } },
    modsDesc: ["Pertes de cohésion amplifiées (courants internes)", "Intégrité de départ élevée"]
  },
  benjamin: {
    id: "benjamin",
    name: "Le Benjamin", nameF: "La Benjamine",
    tag: "Nouvelle génération · 34 ans",
    emoji: "⚡",
    party: "Mouvement Demain",
    plus: "Fraîcheur, maîtrise des réseaux, aucun bilan à défendre",
    minus: "Inexpérience, très peu d’élus derrière soi",
    challenge: "Prouver qu’on a l’étoffe d’un chef d’État avant d’avoir 35 ans.",
    stats: { sondages: 46, tresorerie: 52, cohesion: 52, credibilite: 40 },
    parrainages: 320,
    mods: { sondages: { pos: 1.2 }, credibilite: { pos: 0.75 } },
    modsDesc: ["Gains de sondages amplifiés (effet nouveauté)", "Gains de crédibilité réduits (procès en inexpérience)"]
  },
  technocrate: {
    id: "technocrate",
    name: "Le Technocrate", nameF: "La Technocrate",
    tag: "Centre / Droite modérée",
    emoji: "📈",
    party: "Alliance pour la Réforme",
    plus: "Excellente crédibilité économique, rassure les marchés",
    minus: "Manque de charisme, perçu comme déconnecté",
    challenge: "Créer un lien émotionnel avec les Français face aux crises.",
    stats: { sondages: 36, tresorerie: 62, cohesion: 62, credibilite: 76 },
    parrainages: 400,
    mods: { sondages: { pos: 0.8 }, credibilite: { neg: 0.7 } },
    modsDesc: ["Gains de sondages réduits (manque de charisme)", "Pertes de crédibilité amorties"]
  }
};

const CHARACTERS = {
  antoine:   { name: "Antoine Ferrand",   role: "Directeur de campagne",            color: "#3b82f6" },
  claire:    { name: "Claire Vasseur",    role: "Trésorière de campagne",           color: "#10b981" },
  ines:      { name: "Inès Belkacem",     role: "Conseillère communication",        color: "#ec4899" },
  gerard:    { name: "Gérard Molinier",   role: "Pôle élus locaux",                 color: "#f59e0b" },
  samir:     { name: "Samir Haddad",      role: "Pôle recherche",                   color: "#8b5cf6" },
  riviere:   { name: "Jean-Paul Rivière", role: "Maire de Saint-Aubin (Creuse)",    color: "#78716c" },
  president: { name: "Le Président",      role: "Ligne sécurisée — Élysée",         color: "#1e3a8a" },
  royer:     { name: "Bastien Royer",     role: "Collectif Réveil",                 color: "#991b1b" },
  lea:       { name: "Léa Fontaine",      role: "Porte-parole, Dernière Alerte Climat", color: "#16a34a" },
  castagnet: { name: "Bernard Castagnet", role: "Sénateur du Gers depuis 1998",     color: "#7c2d12" },
  morel:     { name: "Jade Morel",        role: "Candidate, 8 M d’abonnés",         color: "#d946ef" },
  vallier:   { name: "Catherine Vallier", role: "Ex-directrice générale du FMI",    color: "#334155" },
  arnoult:   { name: "Philippe Arnoult",  role: "Cercle Santé Avenir",              color: "#475569" },
  lenoir:    { name: "Thomas Lenoir",     role: "Journaliste, Le Canard enchaîné",  color: "#b45309" },
  helene:    { name: "Hélène Marchal",    role: "Candidate éliminée (15 %)",        color: "#0e7490" },
  baudoin:   { name: "Charles-Henri Baudoin", role: "Propriétaire du groupe Médiacorp", color: "#111827" }
};

const OPPONENT = "Victor Delmas";

/* ------------------------------------------------------------------ */
/* ACTE I — L’HIVER                                                    */
/* ------------------------------------------------------------------ */
const ACT1 = [
  {
    id: "a1_intro", date: "3 janv.", from: "antoine",
    text: [
      "{titre}, bienvenue dans la vraie campagne.",
      "Le Conseil constitutionnel clôt le dépôt des parrainages le 4 mars. Il nous en faut 500, signés par des élus d’au moins 30 départements.",
      "On en a {parr} de sécurisés. Comment on attaque ?"
    ],
    choices: [
      {
        text: "Tournée des campagnes : je veux voir les maires ruraux un par un.",
        fx: { treso: -8, sond: 2, coh: 3, parr: 70 },
        result: "Trois semaines, 4 000 km, des centaines de cafés du commerce. Les maires apprécient qu’on vienne enfin les voir.",
        news: "{nom} entame un tour de France des mairies rurales"
      },
      {
        text: "Misons sur les grands élus : sénateurs, présidents de région, barons locaux.",
        fx: { cred: 4, coh: -4, integ: -3, parr: 55 },
        result: "Les barons signent, mais chacun note soigneusement ce que vous lui devez. Les militants grincent : « encore les mêmes ».",
        news: "Plusieurs grands élus apportent leur soutien à {nom}"
      },
      {
        text: "Lançons un appel public aux maires sur les réseaux sociaux.",
        fx: { sond: 5, cred: -3, parr: 35 },
        result: "La vidéo fait 2 millions de vues. Les maires, eux, n’aiment pas trop qu’on leur force la main en public.",
        news: "L’appel de {nom} aux maires fait le buzz"
      }
    ]
  },
  {
    id: "a1_vie_chere", date: "10 janv.", from: "antoine",
    text: [
      "Vous avez vu les images ? Un million de personnes dans la rue hier selon les syndicats, 400 000 selon la police.",
      "Lycéens, profs, retraités, gilets jaunes, infirmières : tout le monde défile contre la vie chère. Le plein à 2 €, les courses qui flambent, les salaires gelés.",
      s => s.arch.id === "heritier"
        ? "Et c’est le gouvernement dont vous faisiez partie qu’ils visent. Les caméras vous attendent."
        : "Les cortèges remontent le boulevard en ce moment même. Les caméras attendent de voir qui ose venir."
    ],
    choices: [
      {
        text: "Je marche dans le cortège, au milieu des gens.",
        fx: { sond: 5, coh: 3, cred: -3 },
        result: "Applaudissements et sifflets mêlés. « Vous étiez où, les autres années ? » vous lance une aide-soignante. La photo fait quand même la une.",
        news: "{nom} défile contre la vie chère"
      },
      {
        text: "Je présente un plan chiffré : blocage des prix de 50 produits, hausse du Smic.",
        fx: { cred: 5, sond: 3, treso: -4 },
        promise: "Bloquer les prix de 50 produits de première nécessité",
        result: "Les économistes discutent les chiffres, les syndicats saluent « une base de travail ». Les manifestants, eux, attendent de voir."
      },
      {
        text: "J’appelle au calme : on ne règle rien en cassant des vitrines.",
        fx: { cred: 3, sond: -3, coh: 2 },
        result: "Les commerçants et les plus âgés approuvent. Dans les cortèges, votre nom est désormais scandé… mais pas en bien."
      },
      {
        text: "J’appelle à la grève générale jusqu’à la hausse des salaires.",
        condition: s => s.arch.id === "tribun",
        fx: { sond: 7, coh: 5, cred: -8 },
        result: "Votre appel est repris par une partie des syndicats et par toutes les AG étudiantes. Le patronat parle d’« irresponsabilité ». Les cortèges suivants brandissent vos pancartes.",
        news: "{nom} appelle à la grève générale"
      },
      {
        text: "« C’est la France d’en bas contre les élites de Bruxelles. »",
        condition: s => s.arch.id === "patriote",
        fx: { sond: 5, coh: 3, cred: -5 },
        result: "Les gilets jaunes les plus remontés reprennent la formule. Les syndicats, eux, refusent que vous récupériez leur mouvement."
      }
    ]
  },
  {
    id: "a1_maternite", date: "14 janv.", from: "riviere",
    text: [
      "Bonjour {titre}. Jean-Paul Rivière, maire de Saint-Aubin, dans la Creuse.",
      "Je préside l’association des maires ruraux du département. Une quarantaine de collègues suivent mes consignes.",
      "Notre maternité doit fermer en juin : 280 naissances par an, 3 millions de déficit. Promettez publiquement de la maintenir, et vous aurez nos signatures."
    ],
    choices: [
      {
        text: "Je m’y engage. Aucune femme ne devrait faire 80 km pour accoucher.",
        fx: { sond: 3, cred: -8, parr: 40 },
        promise: "Maintenir la maternité de Saint-Aubin",
        result: "Rivière tient parole : les signatures arrivent. Mais Les Échos chiffrent déjà le coût de « la promesse de la Creuse » si elle s’applique aux 60 maternités menacées.",
        news: "Maternités : {nom} promet de sauver les petits établissements"
      },
      {
        text: "Je ne ferai pas une promesse que je ne pourrai pas tenir.",
        fx: { cred: 5, sond: -2, integ: 5, parr: 5 },
        result: "Long silence au bout du fil. « Au moins, vous ne me baratinez pas. » Seuls cinq maires vous suivront."
      },
      {
        text: "Je vous promets une mission d’évaluation dès mon élection.",
        fx: { cred: -2, integ: -6, parr: 20 },
        result: "Rivière n’est pas dupe, mais il en convainc une vingtaine. « On s’en souviendra, {titre}. »"
      }
    ]
  },
  {
    id: "a1_argent", date: "22 janv.", from: "claire",
    text: [
      "Il faut qu’on parle d’argent.",
      "Un promoteur immobilier lyonnais, Serge Koval, propose 400 000 €. La loi plafonne les dons à 4 600 € par personne, évidemment…",
      "Il a « des amis, des cousins, des salariés » prêts à donner chacun le maximum. Ça financerait la moitié de nos déplacements."
    ],
    choices: [
      {
        text: "Acceptez. Personne ne vérifiera chaque donateur.",
        fx: { treso: 25, integ: -20, scand: 30, dette: 1 },
        flag: "koval",
        result: "Les virements arrivent en 48 heures. Claire range le dossier dans un tiroir fermé à clé, sans un mot."
      },
      {
        text: "Refusez. On ne joue pas avec ça.",
        fx: { treso: -4, coh: 2, integ: 6 },
        result: "Claire sourit, soulagée. « Je préfère ça. On va serrer les boulons. »"
      },
      {
        text: "Négociez plutôt un prêt bancaire, même cher.",
        fx: { treso: 12, coh: -2 },
        result: "La banque prête à 7 %. Cher, mais propre. Il faudra dépasser 5 % au premier tour pour être remboursé par l’État."
      }
    ]
  },

  /* --- Événements spécifiques à l’archétype --- */
  {
    id: "a1_heritier", date: "29 janv.", from: "president", only: ["heritier"],
    text: [
      "C’est le Président. Je souhaite apparaître à vos côtés lors de votre déplacement à Tours.",
      "Mes réseaux d’élus attendent un signal. Si je suis là, ils signeront tous.",
      "Je compte sur votre loyauté."
    ],
    choices: [
      {
        text: "Avec plaisir, Monsieur le Président.",
        fx: { sond: -7, treso: 8, coh: 4, parr: 90 },
        result: "Les photos vous montrent côte à côte. 120 élus signent dans la semaine. Les sondages, eux, vous associent désormais aux 62 % d’impopularité du sortant.",
        news: "Le Président sortant adoube {nom} à Tours"
      },
      {
        text: "Je dois incarner le renouveau. Je viendrai seul{e}.",
        fx: { sond: 6, coh: -10, integ: 3, parr: 25 },
        result: "Le Palais encaisse mal. Plusieurs ministres font savoir en off qu’ils « s’en souviendront ». Mais l’opinion salue votre indépendance.",
        news: "{nom} prend ses distances avec l’Élysée"
      },
      {
        text: "Proposez-lui un dîner discret avec les élus, sans caméras.",
        fx: { sond: -1, coh: 1, parr: 60 },
        result: "Le dîner se tient à huis clos. Les élus signent… et Le Canard enchaîné en publie le menu la semaine suivante.",
        news: "Le dîner secret de {nom} avec le chef de l’État"
      }
    ]
  },
  {
    id: "a1_patriote", date: "29 janv.", from: "royer", only: ["patriote"],
    text: [
      "Salut. Bastien Royer, du Collectif Réveil.",
      "On sait que les maires ont peur de vous parrainer : leurs noms sont publiés, ils craignent les représailles.",
      "Nous, on tient 90 petits élus et des milliers de militants. En échange, nos gars entrent dans votre équipe. Bon… notre fondateur a quelques casseroles judiciaires."
    ],
    choices: [
      {
        text: "Marché conclu. On a besoin de tout le monde.",
        fx: { cred: -12, coh: -5, integ: -12, scand: 10, parr: 95 },
        flag: "reveil",
        result: "Les parrainages affluent. Les photos de vos nouveaux alliés aussi, et certaines datent de manifestations peu fréquentables.",
        news: "Le Collectif Réveil rejoint la campagne de {nom} : malaise"
      },
      {
        text: "Hors de question. Notre mouvement doit rester respectable.",
        fx: { cred: 6, coh: -3, integ: 4 },
        result: "Royer raccroche en vous traitant de « vendu au système ». Votre base est partagée, mais les éditorialistes notent le geste."
      },
      {
        text: "Dénoncez publiquement le système des parrainages qui bâillonne le peuple.",
        fx: { sond: 7, cred: -5, parr: 40 },
        result: "Votre tribune fait mouche : des maires signent par défi. Le Conseil constitutionnel rappelle sèchement que la loi s’applique à tous.",
        news: "{nom} dénonce « le verrou des parrainages »"
      }
    ]
  },
  {
    id: "a1_tribun", date: "29 janv.", from: "ines", only: ["tribun"],
    text: [
      "Nuit d’émeutes à Villiers-sur-Orge. Un adolescent de 17 ans a été grièvement blessé par un tir policier lors d’un contrôle routier.",
      "Les vidéos contredisent la version officielle. Des lycées aux facs, nos jeunes militants attendent que vous parliez, et vite.",
      "Les chaînes d’info, elles, attendent que vous dérapiez."
    ],
    choices: [
      {
        text: "« La police blesse et tue. Ce système doit tomber. »",
        fx: { sond: 5, coh: 6, cred: -10, integ: -2 },
        result: "Lycéens, étudiants et jeunes des quartiers vous suivent comme un seul homme. Les syndicats de police portent plainte, et tous les autres candidats vous somment de « choisir votre camp ».",
        news: "Émeutes : {nom} met en cause la police, tollé politique"
      },
      {
        text: "J’appelle au calme et exige une enquête indépendante.",
        fx: { cred: 6, coh: -8, sond: -1, integ: 3 },
        result: "Les éditorialistes saluent votre « hauteur ». Sur les réseaux, une partie de votre base vous trouve tiède. « Maintenant on parle comme les autres ? »"
      },
      {
        text: "Je vais à Villiers cette nuit, sans caméras, parler aux jeunes.",
        fx: { treso: -3, sond: 3, coh: 3, cred: 2, parr: 15 },
        result: "Trois heures au pied des tours, à écouter. Une vidéo filmée par un habitant fait le tour du pays. Plusieurs maires de banlieue appellent ensuite le QG.",
        news: "Nuit à Villiers : {nom} au contact des habitants"
      }
    ]
  },
  {
    id: "a1_ecolo", date: "29 janv.", from: "lea", only: ["ecolo"],
    text: [
      "Bonjour {nom}. Léa Fontaine, de Dernière Alerte Climat.",
      "Demain à 7 h, on bloque le périphérique parisien et on se colle au bitume. Deux cents militants. Beaucoup votent pour vous.",
      "On attend votre soutien public. Sinon, on dira que l’écologie politique a choisi les salons plutôt que la rue."
    ],
    choices: [
      {
        text: "Je soutiens. La désobéissance civile est légitime face à l’urgence.",
        fx: { coh: 6, sond: -4, cred: -7 },
        result: "Ta base climat jubile. Les automobilistes bloqués trois heures, eux, deviennent les héros du 20 h. « L’écologie qui emmerde les gens qui bossent », titre un hebdo.",
        news: "Blocage du périphérique : {nom} soutient les activistes"
      },
      {
        text: "Je condamne. On ne gagnera pas les Français en les empêchant d’aller travailler.",
        fx: { cred: 5, sond: 2, coh: -10 },
        result: "Les modérés respirent. Léa Fontaine publie une tribune assassine, et l’aile radicale de Terre Commune menace de faire campagne « en autonomie »."
      },
      {
        text: "Je comprends la colère, mais je propose d’en faire une grande marche autorisée.",
        fx: { coh: 2, sond: 1, treso: -5 },
        result: "Léa hésite, puis accepte. La marche réunit 60 000 personnes sous la pluie. Moins spectaculaire, mais personne ne vous en veut.",
        news: "Climat : marche géante à Paris à l’appel de {nom}"
      }
    ]
  },
  {
    id: "a1_benjamin", date: "29 janv.", from: "castagnet", only: ["benjamin"],
    text: [
      "{nom}, je vous observe depuis des mois. Vous avez du talent. Mais vous n’avez personne.",
      "Moi, j’ai quarante ans de mandats et cent vingt maires qui signent quand je décroche mon téléphone.",
      "Je vous les offre. En échange, je choisis votre directeur de campagne, et je serai votre Premier ministre. Vous aurez l’image, j’aurai les clés."
    ],
    choices: [
      {
        text: "Marché conclu, Monsieur le sénateur.",
        fx: { sond: -6, coh: -4, integ: -8, dette: 1, parr: 110 },
        flag: "castagnet",
        promise: "Bernard Castagnet nommé à Matignon",
        result: "Les signatures pleuvent. Antoine est remplacé par un fidèle de Castagnet. Sur les réseaux, un montage vous montre en marionnette. #LePantin",
        news: "Le vieux sénateur Castagnet adoube {nom}"
      },
      {
        text: "Merci, mais je ne serai le pantin de personne.",
        fx: { sond: 4, cred: -2, integ: 5, parr: 10 },
        result: "Castagnet raccroche : « Vous apprendrez. » Vos abonnés adorent votre audace. Gérard, lui, regarde le compteur de parrainages et soupire."
      },
      {
        text: "Je prends vos maires, et je vous offre la présidence de mon comité de soutien.",
        fx: { coh: -3, cred: 3, integ: -2, parr: 55 },
        result: "Castagnet ricane, puis accepte : le titre flatte son ego. La moitié de ses maires signent. L’autre attend de voir si vous tiendrez le choc."
      }
    ]
  },
  {
    id: "a1_techno", date: "29 janv.", from: "ines", only: ["technocrate"],
    text: [
      "On a un problème. 🔥",
      "Hier sur France Info, quand on vous a demandé le prix d’un ticket de métro, vous avez répondu « environ 50 centimes ».",
      "C’est 2,50 €. La séquence fait 4 millions de vues. #HorsSol est en tête des tendances."
    ],
    choices: [
      {
        text: "Je fais une vidéo d’excuses, sincère, sans communicant.",
        fx: { sond: 3, cred: 2 },
        result: "Votre autodérision surprend : « Je prends plus souvent ma voiture de fonction que le métro, et c’est un problème. » Le clip est partagé… en bien, cette fois.",
        news: "« Hors-sol » : {nom} fait son mea culpa"
      },
      {
        text: "Organisez une semaine d’immersion : métro, marchés, boulangeries.",
        fx: { treso: -8, sond: 4, cred: -3 },
        result: "Les images sont belles, mais des journalistes repèrent les figurants. « Opération com », titre Libération."
      },
      {
        text: "Ignorez. Les Français votent sur des idées, pas sur des tickets de métro.",
        fx: { sond: -7, cred: 3, coh: -3 },
        result: "Le buzz retombe après trois jours de mèmes. Votre image d’élite déconnectée, elle, s’installe durablement."
      }
    ]
  },

  {
    id: "a1_radio", date: "8 févr.", from: "ines",
    text: [
      "Demain, matinale de France Inter, 8 h 20. Le journaliste va vous coincer sur le chiffrage de notre mesure phare.",
      "Les économistes l’estiment à 35 milliards. Notre chiffrage officiel dit 12. On répond quoi ?"
    ],
    choices: [
      {
        text: "On maintient 12 milliards, avec aplomb.",
        fx: { sond: 4, cred: -9, integ: -5 },
        result: "Vous ne cillez pas. Le lendemain, trois instituts publient un démenti. « Le candidat des chiffres magiques », titre L’Opinion.",
        news: "Chiffrage contesté : les économistes démentent {nom}"
      },
      {
        text: "Je reconnais que le chiffrage sera revu.",
        fx: { cred: 6, sond: -3, coh: -2, integ: 3 },
        result: "L’honnêteté surprend. Les économistes saluent ; les militants se demandent si la mesure va être abandonnée."
      },
      {
        text: "J’attaque : « Les mêmes experts n’avaient pas vu venir la crise de 2008. »",
        fx: { sond: 5, cred: -5, coh: 3 },
        result: "La punchline tourne en boucle sur les réseaux. Le chiffrage, lui, reste flou."
      }
    ]
  },
  {
    id: "a1_sans_programme", date: "11 févr.", from: "samir", pool: true,
    text: [
      "{titre}, j’ai une mauvaise nouvelle.",
      "Le Monde publie ce matin un comparatif des programmes de tous les candidats. Notre colonne est vide. Littéralement : « Programme non communiqué ».",
      "Trois autres candidats sont dans le même cas, mais c’est nous qu’on cite en premier. On fait quoi ?"
    ],
    choices: [
      {
        text: "On sort un programme complet en dix jours. Tout le monde au travail.",
        fx: { treso: -6, coh: -4, cred: 5 },
        result: "Samir et son équipe ne dorment plus. Le document de 180 pages sort à temps, avec deux erreurs de chiffrage que la presse s’empresse de relever."
      },
      {
        text: "On lance une consultation citoyenne : ce sont les Français qui écriront le programme.",
        fx: { sond: 4, cred: -4, coh: 2 },
        flag: "sans_programme",
        result: "La plateforme reçoit 300 000 contributions. Belle opération. Mais vous n’avez toujours rien à présenter, et les journalistes l’ont noté."
      },
      {
        text: "Personne ne lit les programmes. Les Français votent pour une personne, une vision.",
        fx: { sond: 2, cred: -8, integ: -3 },
        flag: "sans_programme",
        result: "La phrase fuite. « Le candidat sans programme », titre Libération. Vos adversaires en font un slogan.",
        news: "« Personne ne lit les programmes » : la phrase de {nom} qui fait polémique"
      }
    ]
  },
  {
    id: "a1_lyceens", date: "13 févr.", from: "ines", pool: true,
    text: [
      "Une vidéo explose : devant un lycée bloqué à Rennes, une lycéenne de 17 ans vous interpelle face caméra.",
      "« Vous allez faire quoi pour nous ? Parcoursup nous broie, nos profs ne sont pas remplacés, et vous, vous parlez de la dette ! »",
      "Deux millions de vues. Elle attend une réponse, et tous les 18-25 ans aussi."
    ],
    choices: [
      {
        text: "Je promets la suppression de Parcoursup dès la rentrée suivante.",
        fx: { sond: 6, cred: -5 },
        promise: "Supprimer Parcoursup",
        result: "Les lycées s’enflamment… pour vous. Les présidents d’université demandent par quoi vous comptez le remplacer. Vous n’en avez aucune idée.",
        news: "{nom} promet la fin de Parcoursup"
      },
      {
        text: "Je vais la voir à Rennes, et je l’écoute une heure devant les caméras.",
        fx: { sond: 4, cred: 2, treso: -3 },
        result: "L’échange est franc, parfois tendu. Elle ne votera peut-être pas pour vous, mais elle le dit en direct : « Au moins, cette personne est venue. »"
      },
      {
        text: "Les lycéens doivent être en cours, pas derrière des poubelles.",
        fx: { sond: -4, cred: 2, coh: 2 },
        result: "La phrase ravit une partie des plus de 60 ans. Sur TikTok, vous devenez un mème pour toute une génération."
      }
    ]
  },
  {
    id: "a1_primaire", date: "18 févr.", from: "gerard", pool: true,
    text: [
      "Mauvaise nouvelle des sondages : vous et Mathieu Garnier, l’autre candidat de votre famille politique, vous neutralisez. À deux, aucun de vous ne passe le premier tour.",
      "Garnier propose une primaire express le 1er mars. Le perdant se retire et soutient l’autre.",
      "La moitié de nos cadres pense qu’on la gagne. L’autre moitié pense que c’est un piège."
    ],
    choices: [
      {
        text: "J’accepte la primaire. Que le meilleur gagne.",
        fx: { treso: -10, sond: 7, coh: -5, parr: 30 },
        result: "Dix jours de campagne dans la campagne, des coups bas, un débat tendu. Vous l’emportez avec 54 %. Garnier se rallie du bout des lèvres, avec ses élus.",
        news: "{nom} remporte la primaire face à Mathieu Garnier"
      },
      {
        text: "Je refuse. Garnier n’a qu’à se retirer lui-même.",
        fx: { coh: 4, sond: -4, cred: -2 },
        result: "Garnier vous accuse de « faire gagner les extrêmes ». Les deux campagnes continuent de se marcher dessus."
      },
      {
        text: "Je lui propose un deal : il se retire, je lui offre un grand ministère.",
        fx: { sond: 5, coh: -3, integ: -5, parr: 25 },
        promise: "Un grand ministère pour Mathieu Garnier",
        result: "Garnier se fait prier deux jours, puis annonce son retrait « dans l’intérêt général ». Personne n’est dupe.",
        news: "Mathieu Garnier se retire et soutient {nom}"
      }
    ]
  },
  {
    id: "a1_sprint", date: "26 févr.", from: "gerard",
    text: [
      "{titre}, point parrainages : nous en sommes à {parr}.",
      s => s.parr >= 500
        ? "La barre est franchie, mais le Conseil constitutionnel invalide toujours quelques signatures. Je voudrais une marge de sécurité."
        : `Il en manque ${500 - s.parr}. Le dépôt ferme dans sept jours.`,
      "J’ai trois options sur la table."
    ],
    choices: [
      {
        text: "Promettez des investitures aux législatives à des maires indécis.",
        fx: { coh: -10, integ: -6, parr: 70 },
        promise: "Investitures aux législatives promises à 40 maires",
        result: "Les signatures tombent. Au QG, des cadres qui attendaient ces circonscriptions depuis des années l’apprennent par la presse."
      },
      {
        text: "Faites appel à un « cabinet de conseil aux élus ».",
        fx: { treso: -15, integ: -8, scand: 12, parr: 60 },
        flag: "cabinet",
        result: "Le cabinet obtient des signatures en un temps record. Mieux vaut ne pas savoir comment."
      },
      {
        text: "Un appel solennel au 20 h : « Laissez les Français choisir. »",
        fx: { sond: 3, cred: 2, parr: 35 },
        result: "Votre intervention émeut. Des dizaines de maires sans étiquette se manifestent, parfois pour la première fois de leur vie.",
        news: "Au 20 h, {nom} lance un appel solennel aux maires"
      }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* ACTE II — LE PRINTEMPS                                              */
/* ------------------------------------------------------------------ */
const ACT2 = [
  {
    id: "a2_meeting", date: "9 mars", from: "claire",
    text: [
      "Candidature validée, la campagne officielle démarre ! 🎉",
      "Antoine veut un grand meeting de lancement. Moi, je regarde les comptes. Quelle formule ?"
    ],
    choices: [
      {
        text: "Bercy. 20 000 personnes. Il faut frapper fort.",
        fx: { treso: -25, sond: 8, coh: 6 },
        result: "Drapeaux, fumigènes, une salle debout pendant dix minutes. Les images sont superbes. La facture aussi.",
        news: "Démonstration de force pour {nom} à Bercy"
      },
      {
        text: "Un meeting en plein air, gratuit, place de la République.",
        fx: { treso: -8, sond: 4, coh: 2 },
        result: "Il pleut. 8 000 courageux restent jusqu’au bout. Les images de militants trempés qui chantent sous l’averse font le tour des réseaux."
      },
      {
        text: "Un meeting simultané dans dix villes, par hologramme.",
        fx: { treso: -16, sond: 5, cred: -2 },
        result: "Le dispositif impressionne les jeunes. Les éditorialistes parlent de gadget.",
        news: "{nom} se démultiplie en hologramme"
      }
    ]
  },
  {
    id: "a2_epreuve", date: "11 mars", from: "ines",
    condition: s => s.flags.has("sans_programme"),
    text: [
      "Le piège se referme. France 2 vous invite jeudi à « L’Épreuve des faits » : quatre économistes, votre programme, chiffré en direct.",
      "Problème : on n’a toujours pas de programme. Tous les autres candidats y sont passés. Refuser, c’est avouer."
    ],
    choices: [
      {
        text: "J’y vais et j’improvise. J’ai de la répartie.",
        fx: { sond: 2, cred: -9 },
        result: "Vous enchaînez les formules creuses. « Et combien ça coûte ? » revient onze fois. L’extrait tourne toute la semaine.",
        news: "« L’Épreuve des faits » : {nom} en grande difficulté"
      },
      {
        text: "On présente en urgence dix mesures phares, bien chiffrées.",
        fx: { treso: -5, cred: 4, coh: -2 },
        result: "Dix mesures, pas une de plus. Les économistes trouvent ça mince, mais solide. Vous sauvez les meubles."
      },
      {
        text: "Je refuse et je dénonce « la dictature des chiffres ».",
        fx: { sond: -2, cred: -5, coh: 3 },
        result: "Votre base applaudit. France 2 laisse votre fauteuil vide pendant toute l’émission, votre nom bien en évidence."
      }
    ]
  },
  {
    id: "a2_morel", date: "12 mars", from: "morel",
    text: [
      "Coucou 👋 c’est Jade. Jade Morel. Oui, celle de la télé.",
      "J’ai eu mes 500 parrainages hier, je suis à 9 % dans les sondages et j’ai pas de programme. Les gens s’en fichent, ils veulent juste quelqu’un de vrai 💅",
      "Bref, je te pique des électeurs. On pourrait s’arranger, non ?"
    ],
    choices: [
      {
        text: "Je dénonce une candidature sans programme : la présidence n’est pas un casting.",
        fx: { cred: 4, sond: -3 },
        result: "Les éditorialistes approuvent. Ses 8 millions d’abonnés, beaucoup moins : vous voilà sacré{e} « boomer de la campagne ».",
        news: "{nom} tacle Jade Morel : « La présidence n’est pas un casting »"
      },
      {
        text: "Je l’invite à un live commun : programme contre punchlines.",
        fx: { sond: 5, cred: -2 },
        result: "Le live bat des records. Elle est drôle, vous êtes précis{e}. Une partie de ses fans découvre que la politique peut être autre chose qu’un plateau télé."
      },
      {
        text: "Je lui propose un ministère si elle se rallie au second tour.",
        fx: { sond: 3, cred: -5, integ: -4 },
        promise: "Un ministère pour Jade Morel",
        result: "« Ministre de la Jeunesse ? Trop stylé. » Elle accepte… et l’annonce aussitôt en story, avant même que votre équipe soit au courant.",
        news: "Jade Morel annonce un « deal » avec {nom}"
      }
    ]
  },
  {
    id: "a2_dossier", date: "15 mars", from: "samir",
    text: [
      "{titre}, on a trouvé quelque chose.",
      "Victor Delmas, le favori. Un compte non déclaré au Luxembourg, ouvert en 2011, alimenté par une société de conseil fantôme. On a les relevés.",
      "Qu’est-ce qu’on en fait ?"
    ],
    choices: [
      {
        text: "Faites-le fuiter anonymement à la presse.",
        fx: { sond: 7, integ: -15, scand: 15 },
        flag: "fuite",
        result: "Mediapart publie 48 heures plus tard. Delmas perd quatre points. Personne ne sait d’où vient la fuite… pour l’instant.",
        news: "Révélations : Victor Delmas détiendrait un compte au Luxembourg"
      },
      {
        text: "Je le sortirai moi-même pendant le débat télévisé.",
        fx: { coh: 3, integ: -5 },
        flag: "dossier_debat",
        result: "Samir glisse les relevés dans une enveloppe kraft. « Il sera prêt. » Le coup est armé."
      },
      {
        text: "Gardez-le sous le coude. Je veux gagner sur mes idées.",
        fx: { sond: -2, coh: -3, integ: 10 },
        flag: "dossier_garde",
        result: "Samir hoche la tête, déçu. Le dossier rejoint le coffre. Il pourrait encore servir… ou vous hanter."
      }
    ]
  },
  {
    id: "a2_vallier", date: "18 mars", from: "vallier", pool: true,
    text: [
      "Bonjour {nom}. Catherine Vallier.",
      "J’annonce demain ma candidature. Je n’ai pas de programme : je n’en ai pas besoin. Mon parcours parle pour moi, et les marchés m’adorent.",
      "Je vous propose d’éviter une guerre inutile. Je renonce, si vous me nommez à Matignon."
    ],
    choices: [
      {
        text: "Pas de ticket. On ne gouverne pas avec un CV.",
        fx: { sond: 3, coh: 2, cred: -2 },
        result: "Vallier se lance quand même. Elle plafonne à 6 %, mais elle vous prend des voix au centre et les éditorialistes l’adorent."
      },
      {
        text: "Marché conclu : vous renoncez, et Matignon est à vous.",
        fx: { cred: 8, sond: 2, coh: -6, integ: -3 },
        flag: "vallier_ralliee",
        promise: "Catherine Vallier nommée à Matignon",
        result: "Vallier annonce son soutien depuis Francfort. Les marchés applaudissent. Vos militants découvrent qu’ils feront campagne avec une ancienne banquière.",
        news: "Catherine Vallier renonce et rejoint {nom}"
      },
      {
        text: "Lancez-vous. Les Français jugeront une candidate sans programme.",
        fx: { sond: -2, cred: 3, integ: 2 },
        result: "Elle se lance. Au premier débat, une journaliste lui demande sa mesure phare : long silence. Vous n’avez rien eu à faire."
      }
    ]
  },
  {
    id: "a2_usine", date: "21 mars", from: "antoine",
    text: [
      "Alerte : le groupe Valorel annonce la fermeture de son usine de Denain. 600 emplois.",
      "Les ouvriers occupent le site. Toutes les caméras sont là. Delmas y va cet après-midi."
    ],
    choices: [
      {
        text: "J’y vais et je promets une nationalisation temporaire.",
        fx: { sond: 8, cred: -8 },
        promise: "Nationaliser l’usine Valorel de Denain",
        result: "Debout sur une palette, mégaphone en main, vous êtes acclamé{e}. Le patronat parle de « folie économique ».",
        news: "À Denain, {nom} promet de nationaliser l’usine Valorel"
      },
      {
        text: "Je propose un plan de reprise chiffré, avec un repreneur.",
        fx: { cred: 7, sond: 1, treso: -3 },
        result: "Votre plan est sérieux et salué par les syndicats… mais beaucoup moins télégénique que les promesses de vos concurrents."
      },
      {
        text: "Je reste à Paris : pas de récupération du malheur des gens.",
        fx: { sond: -5, coh: -3, integ: 3 },
        result: "Les ouvriers retiennent surtout votre absence. « Ils viennent tous, sauf {nom} », lâche un délégué syndical au 20 h."
      }
    ]
  },
  {
    id: "a2_mairie", date: "24 mars", from: "antoine", pool: true,
    text: [
      "Nuit de violences en marge d’une manifestation contre la vie chère : la mairie de Limoges a été incendiée, des commerces pillés à Marseille.",
      "Des manifestants pacifiques ont aussi été blessés par des tirs de LBD. Les deux vidéos tournent en boucle.",
      "Delmas réclame l’interdiction des manifestations jusqu’à l’élection. Tout le monde attend votre position."
    ],
    choices: [
      {
        text: "Fermeté absolue : les casseurs en prison, les manifestations encadrées.",
        fx: { sond: 4, cred: 3, coh: -4 },
        result: "Les maires et les plus âgés applaudissent. Les syndicats vous accusent de criminaliser la colère sociale."
      },
      {
        text: "Je condamne toutes les violences, y compris celles de la police.",
        fx: { sond: -1, cred: 2, coh: 3, integ: 2 },
        result: "Une position d’équilibre, attaquée des deux côtés. Les syndicats de police parlent d’« une honte », les manifestants du « strict minimum »."
      },
      {
        text: "Je me rends à Limoges pour soutenir le maire et les agents municipaux.",
        fx: { treso: -3, cred: 5, sond: 2 },
        result: "Devant les murs noircis, vous parlez peu et écoutez beaucoup. Le maire, pourtant d’un autre bord, vous remercie publiquement.",
        news: "{nom} à Limoges, au chevet de la mairie incendiée"
      }
    ]
  },
  {
    id: "a2_lobby", date: "28 mars", from: "arnoult",
    text: [
      "Bonjour {titre}. Philippe Arnoult. Je représente plusieurs grands laboratoires.",
      "Votre projet de taxer les superprofits pharmaceutiques nous inquiète. Retirez-le discrètement, et nos amis financeront une campagne de soutien « citoyenne »… très bien dotée.",
      "Personne n’aura besoin de savoir."
    ],
    choices: [
      {
        text: "Retirez la mesure du programme. Discrètement.",
        fx: { treso: 20, cred: -2, integ: -18, scand: 8, dette: 1 },
        flag: "lobby",
        result: "La mesure disparaît de la page 34 du programme. Des panneaux « Avec {nom}, la santé d’abord » fleurissent dans toute la France."
      },
      {
        text: "Non merci. La mesure reste.",
        fx: { treso: -2, integ: 5 },
        result: "Arnoult raccroche poliment. Vous savez que vous venez de vous faire un ennemi patient."
      },
      {
        text: "Je rends cet échange public.",
        fx: { sond: 5, cred: 3, treso: -5, coh: -2, integ: 5 },
        result: "Votre conférence de presse fait sensation. Le lendemain, plusieurs grands donateurs annulent leurs chèques.",
        news: "{nom} dénonce les pressions de l’industrie pharmaceutique"
      }
    ]
  },

  {
    id: "a2_retraites", date: "30 mars", from: "gerard", pool: true,
    text: [
      "Les retraités sont dans la rue : le gouvernement a gelé les pensions pour 2027. 300 000 manifestants, cheveux blancs et pancartes.",
      "Ils votent à 80 %. Les jeunes, à 55 %. Je dis ça, je dis rien.",
      "Ils veulent un engagement clair sur l’indexation des pensions."
    ],
    choices: [
      {
        text: "Je promets l’indexation intégrale des pensions sur l’inflation.",
        fx: { sond: 6, cred: -5 },
        promise: "Indexer toutes les pensions sur l’inflation",
        result: "Les cortèges scandent votre nom. La Cour des comptes chiffre la promesse à 6 milliards par an."
      },
      {
        text: "Je protège les petites retraites et je demande un effort aux plus aisées.",
        fx: { cred: 5, sond: 1, coh: -2 },
        result: "Une mesure juste, saluée par les économistes. Les retraités aisés, très présents dans les bureaux de vote, font la grimace."
      },
      {
        text: "La priorité, c’est la jeunesse. On ne peut pas tout donner aux retraités.",
        fx: { sond: -5, cred: 2, coh: 2 },
        result: "Les campus applaudissent. Les clubs du troisième âge, nettement moins : vous perdez trois points chez les plus de 65 ans."
      }
    ]
  },

  /* --- Spécifiques à l’archétype --- */
  {
    id: "a2_heritier", date: "2 avr.", from: "antoine", only: ["heritier"],
    text: [
      "La Cour des comptes vient de publier son rapport : dette record, services publics dégradés. Le bilan du gouvernement sortant est étrillé.",
      "Vous étiez ministre de ce gouvernement. Tout le monde attend votre réaction."
    ],
    choices: [
      {
        text: "Je défends le bilan : nous avons tenu le pays dans la tempête.",
        fx: { coh: 8, sond: -7 },
        result: "Le socle est rassuré, les cadres applaudissent. Le reste du pays, lui, entend « continuité »."
      },
      {
        text: "Je m’en démarque : « Ce n’était pas mon gouvernement. »",
        fx: { sond: 7, coh: -12, cred: -3, integ: -4 },
        result: "Les archives ressortent immédiatement : vous, au conseil des ministres, votant chaque budget. Mais une partie de l’opinion apprécie la rupture.",
        news: "{nom} se désolidarise du bilan gouvernemental"
      },
      {
        text: "Je reconnais les erreurs et propose une rupture assumée.",
        fx: { sond: 3, cred: 4, coh: -5, integ: 3 },
        result: "Un exercice d’équilibriste salué par la presse. Les ministres sortants, eux, boudent votre prochain meeting."
      }
    ]
  },
  {
    id: "a2_patriote", date: "2 avr.", from: "ines", only: ["patriote"],
    text: [
      "Catastrophe. Un ancien tweet de Kevin, notre porte-parole, ressort : une « blague » ouvertement raciste datant de 2019.",
      "Tous les plateaux en parlent. Les autres candidats exigent son exclusion."
    ],
    choices: [
      {
        text: "Il est exclu sur-le-champ.",
        fx: { cred: 6, coh: -8, sond: -1 },
        result: "Votre fermeté surprend les médias. Une partie de la base crie à la trahison et à la « dictature du politiquement correct »."
      },
      {
        text: "Je le défends : c’est une cabale médiatique.",
        fx: { coh: 5, cred: -11, sond: 2, integ: -6 },
        result: "Votre base fait bloc. Les éditorialistes, eux, vous rangent définitivement dans la case « infréquentable ».",
        news: "Tweet raciste : {nom} refuse de lâcher son porte-parole"
      },
      {
        text: "Il présente des excuses publiques et se met en retrait.",
        fx: { cred: 2, sond: -2 },
        result: "Une sortie de crise tiède. L’affaire s’éteint en trois jours."
      }
    ]
  },
  {
    id: "a2_tribun", date: "2 avr.", from: "antoine", only: ["tribun"],
    text: [
      "Les socialistes proposent de se rallier à vous dès le premier tour. Leur prix : 40 % des circonscriptions aux législatives.",
      "Nos militants, eux, menacent de déserter si on cède plus de 30 % à « ceux qui ont trahi la gauche ». Évidemment."
    ],
    choices: [
      {
        text: "On accepte les 40 %.",
        fx: { coh: 6, treso: -6, sond: -2 },
        result: "Les socialistes rejoignent le terrain. Vos militants grognent mais restent : ils ont besoin de cette union autant que vous."
      },
      {
        text: "On refuse. C’est moi qui fixe les règles.",
        fx: { coh: -14, sond: 2, cred: 2 },
        result: "Vous gagnez en stature, mais les tracts restent dans les cartons dans une bonne moitié des départements."
      },
      {
        text: "On organise une primaire interne ouverte, circonscription par circonscription.",
        fx: { coh: 3, treso: -10, sond: 2 },
        result: "Le processus est long et coûteux, mais il passe pour démocratique. Tout le monde accepte… en attendant les résultats."
      }
    ]
  },
  {
    id: "a2_ecolo", date: "2 avr.", from: "antoine", only: ["ecolo"],
    text: [
      "Le gazole vient de passer à 2,40 €. Delmas tourne en boucle un clip : « Avec {nom}, la taxe carbone videra vos réservoirs. »",
      "Dans les zones rurales, on perd trois points en une semaine. Des gilets jaunes réapparaissent sur les ronds-points.",
      "La taxe carbone, c’est le cœur de notre programme. On fait quoi ?"
    ],
    choices: [
      {
        text: "On la maintient et on explique : chaque euro sera redistribué.",
        fx: { cred: 6, sond: -6, coh: 3, integ: 3 },
        result: "Les économistes saluent la cohérence. Dans la Creuse ou la Meuse, personne ne lit les tableaux de redistribution : ils voient juste le prix à la pompe."
      },
      {
        text: "On la suspend : pas de transition écologique contre les gens.",
        fx: { sond: 5, coh: -12, cred: -4, integ: -4 },
        result: "Les ronds-points se calment. Au bureau national, l’aile historique parle de « reniement » et deux députés claquent la porte en direct.",
        news: "Volte-face : {nom} suspend la taxe carbone"
      },
      {
        text: "Je promets un « chèque mobilité » de 100 € par mois pour les ruraux.",
        fx: { sond: 6, cred: -7 },
        promise: "Chèque mobilité de 100 €/mois pour les ruraux",
        result: "L’annonce fait mouche dans les campagnes. Coût estimé : 9 milliards par an. Delmas parle de « chèque en bois ».",
        news: "Carburants : {nom} promet un chèque mobilité aux ruraux"
      }
    ]
  },
  {
    id: "a2_benjamin", date: "2 avr.", from: "ines", only: ["benjamin"],
    text: [
      "Une vidéo de 2014 vient de sortir : vous, 22 ans, en soirée étudiante, debout sur une table, en train de chanter à tue-tête avec une bouteille à la main.",
      "Rien d’illégal. Mais Delmas a déjà réagi : « La France n’est pas une soirée d’intégration. »",
      "Le procès en immaturité est lancé. Comment on répond ?"
    ],
    choices: [
      {
        text: "Avec humour : je reposte la vidéo. « J’avais 22 ans. Lui, à 22 ans, il votait déjà les budgets ? »",
        fx: { sond: 6, cred: -3, coh: 2 },
        result: "Le repost dépasse les 10 millions de vues. Les jeunes adorent, les plus de 60 ans sont consternés.",
        news: "Vidéo de soirée : {nom} répond par l’humour"
      },
      {
        text: "Avec gravité : une interview de fond au Monde sur mon programme régalien.",
        fx: { cred: 4, sond: -2 },
        result: "Six pages sérieuses sur la défense et la dette. Les spécialistes notent votre maîtrise. Le grand public, lui, a surtout retenu la table."
      },
      {
        text: "Je contre-attaque : « Delmas fait de la politique depuis 1995. Qu’a-t-il réussi ? »",
        fx: { sond: 3, coh: 3, cred: -2 },
        result: "Le clash fait le buzz et ramène le débat sur le renouvellement. La vidéo est vite oubliée, votre arrogance un peu moins."
      }
    ]
  },
  {
    id: "a2_techno", date: "2 avr.", from: "ines", only: ["technocrate"],
    text: [
      "L’émission « Une ambition intime » veut vous suivre une semaine en famille. Six millions de téléspectateurs.",
      "C’est exactement ce qu’il nous faut pour vous humaniser. Ou pour vous ridiculiser."
    ],
    choices: [
      {
        text: "J’accepte. Les Français doivent voir qui je suis vraiment.",
        fx: { sond: 7, cred: -3 },
        result: "On vous voit faire des crêpes ratées et parler de votre père ouvrier. L’émission bat des records. Certains confrères ironisent sur la « peopolisation ».",
        news: "Carton d’audience pour {nom} dans « Une ambition intime »"
      },
      {
        text: "Je refuse. Ma vie privée n’est pas un argument de campagne.",
        fx: { sond: -2, cred: 3, integ: 2 },
        result: "Le Monde salue votre « sobriété ». Les jeunes électeurs, eux, ne savent toujours pas qui vous êtes."
      },
      {
        text: "J’accepte, mais une seule journée et avec droit de regard sur le montage.",
        fx: { sond: 4 },
        result: "Le reportage est sympathique, un peu lisse. Mission à moitié accomplie."
      }
    ]
  },

  /* --- Événements conditionnels --- */
  {
    id: "a2_fuite", date: "4 avr.", from: "lenoir",
    condition: s => s.flags.has("fuite"),
    text: [
      "Bonjour, Thomas Lenoir, du Canard enchaîné.",
      "Selon nos informations, la fuite sur le compte luxembourgeois de M. Delmas proviendrait de votre pôle recherche. Nous publions mercredi.",
      "Un commentaire ?"
    ],
    choices: [
      {
        text: "Démentez catégoriquement.",
        fx: { sond: -1, integ: -5, scand: 15 },
        result: "Le Canard publie quand même, au conditionnel. Le doute s’installe, et d’autres rédactions commencent à creuser."
      },
      {
        text: "Samir a agi seul. Il est démis de ses fonctions.",
        fx: { coh: -15, sond: -2, integ: -12, scand: -10 },
        result: "Samir démissionne sans un mot. L’équipe a compris le message : chez vous, on ne protège personne."
      },
      {
        text: "J’assume : « Les Français avaient le droit de savoir. »",
        fx: { sond: -5, cred: 3, coh: 4, integ: 6, scand: -15 },
        result: "Votre franchise désarme une partie des critiques. Delmas porte plainte, mais l’affaire perd de son mordant.",
        news: "Fuite sur Delmas : {nom} assume"
      }
    ]
  },
  {
    id: "a2_taupe", date: "5 avr.", from: "antoine",
    condition: s => s.stats.cohesion < 35,
    text: [
      "Le Canard enchaîné publie nos réunions stratégiques mot pour mot. Il y a une taupe au QG.",
      "L’ambiance est exécrable. Deux conseillers menacent de démissionner."
    ],
    choices: [
      {
        text: "Réunion de crise : on vide les sacs, tout le monde.",
        fx: { treso: -5, coh: 12 },
        result: "Quatre heures de cris, puis une pizza à minuit. L’équipe se ressoude, au moins pour un temps."
      },
      {
        text: "Trouvez la taupe et virez-la.",
        fx: { coh: 5, integ: -4 },
        result: "Quelqu’un est renvoyé. Était-ce vraiment la taupe ? Les fuites cessent, l’ambiance devient glaciale."
      },
      {
        text: "On n’a pas le temps pour ça.",
        fx: { coh: -8, sond: -3 },
        result: "Les fuites continuent. Chaque matin, la presse connaît votre stratégie avant vos propres militants."
      }
    ]
  },

  {
    id: "a2_debat", date: "6 avr.", from: "ines",
    text: [
      "Ce soir, le grand débat du premier tour. Douze candidats, trois heures de direct.",
      "Vous aurez au mieux huit minutes de parole. Quelle stratégie ?"
    ],
    choices: [
      {
        text: "Programme chiffré, ton présidentiel.",
        fx: { cred: 8, sond: 2 },
        result: "Vous êtes jugé{e} « le plus crédible » par 31 % des téléspectateurs. Pas le plus marquant, en revanche."
      },
      {
        text: "Punchlines et attaques ciblées contre Delmas.",
        fx: { sond: 7, cred: -5 },
        result: "Trois de vos répliques deviennent virales. Les fact-checkeurs en démontent deux.",
        news: "Débat : {nom} cogne fort sur Delmas"
      },
      {
        text: "Raconter mon histoire personnelle.",
        fx: { sond: 5, coh: 3, cred: -1 },
        result: "Un moment d’émotion sincère, salué même par vos adversaires. Votre équipe a les larmes aux yeux."
      },
      {
        text: "Sortir le dossier luxembourgeois de Delmas en direct.",
        condition: s => s.flags.has("dossier_debat"),
        fx: { sond: 10, cred: -4, integ: -5 },
        flag: "dossier_utilise",
        result: "Silence de mort sur le plateau. Delmas bafouille. Le lendemain, c’est la seule chose dont on parle. Vous passez pour redoutable… ou pour un tueur.",
        news: "Coup de tonnerre au débat : {nom} accuse Delmas d’évasion fiscale"
      }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* ACTE III — L’ENTRE-DEUX-TOURS                                       */
/* ------------------------------------------------------------------ */
const ACT3 = [
  {
    id: "a3_marchal", date: "11 avr.", from: "helene",
    text: [
      "Félicitations pour votre qualification, {nom}. Sincèrement.",
      "J’ai fait 15 %. Mes électeurs feront la différence le 24 avril.",
      "Mon prix est simple : Matignon. Et trois mesures de mon programme dans le vôtre."
    ],
    choices: [
      {
        text: "Marché conclu, Madame la future Première ministre.",
        fx: { sond: 11, coh: -12, integ: -8 },
        promise: "Hélène Marchal nommée à Matignon",
        result: "Marchal appelle à voter pour vous dès le soir même. Vos soutiens historiques, qui la combattaient depuis dix ans, découvrent la nouvelle à la télévision.",
        news: "Hélène Marchal rallie {nom} et vise Matignon"
      },
      {
        text: "Je ne marchande pas les postes. Rejoignez-moi sur les idées.",
        fx: { sond: -2, coh: 4, integ: 6 },
        result: "Marchal appelle à « voter selon sa conscience ». Une partie de ses électeurs vous rejoindra peut-être. Peut-être."
      },
      {
        text: "Un grand ministère et deux de vos mesures. Pas Matignon.",
        fx: { sond: 6, coh: -4, cred: 2 },
        promise: "Un super-ministère pour Hélène Marchal",
        result: "Après une nuit de négociations, Marchal accepte. Son soutien est poli, sans enthousiasme."
      }
    ]
  },
  {
    id: "a3_baudoin", date: "15 avr.", from: "baudoin",
    text: [
      "Mes chaînes et mes journaux touchent vingt millions de Français chaque semaine.",
      "Je peux faire en sorte que votre fin de campagne soit… bien racontée.",
      "En retour, vous ne toucherez pas à la loi sur la concentration des médias. Et je vous suggérerai une ou deux nominations."
    ],
    choices: [
      {
        text: "Nous allons très bien nous entendre.",
        fx: { sond: 9, cred: -3, integ: -20, dette: 2 },
        flag: "baudoin",
        result: "Dès le lendemain, vos meetings ouvrent les journaux de ses chaînes. Les sujets sur Delmas, eux, deviennent étrangement critiques."
      },
      {
        text: "Ma réponse est non.",
        fx: { sond: -3, cred: 2, integ: 6 },
        result: "Le soir même, l’éditorialiste vedette de sa chaîne consacre douze minutes à vos « zones d’ombre »."
      },
      {
        text: "Une interview, c’est tout. Aucune contrepartie.",
        fx: { sond: 3, cred: -1, integ: -2 },
        result: "L’interview est complaisante. Baudoin, lui, considère que vous lui devez déjà quelque chose."
      }
    ]
  },
  {
    id: "a3_ni_ni", date: "16 avr.", from: "antoine",
    text: [
      "Samedi, 400 000 personnes ont défilé partout en France derrière une banderole : « Ni Delmas, ni {nom} ».",
      "Gilets jaunes, syndicalistes, lycéens : ils réclament un référendum d’initiative citoyenne et appellent au vote blanc.",
      "Si le blanc monte, c’est nous qui perdons : l’électorat de Delmas est plus discipliné."
    ],
    choices: [
      {
        text: "Je promets le référendum d’initiative citoyenne dans les six mois.",
        fx: { sond: 6, cred: -4, coh: -2 },
        promise: "Instaurer le référendum d’initiative citoyenne",
        result: "Une partie des gilets jaunes appelle à voter pour vous, « pour une fois ». Les constitutionnalistes s’inquiètent.",
        news: "{nom} promet le RIC pour convaincre la rue"
      },
      {
        text: "Je vais à leur rencontre, place de la Concorde, sans service d’ordre.",
        fx: { sond: 4, cred: 2, treso: -2 },
        result: "Vous vous faites huer, puis écouter. Une heure de dialogue tendu, retransmise en direct. Certains repartent convaincus, d’autres non."
      },
      {
        text: "Voter blanc, c’est voter Delmas. Je le dis clairement.",
        fx: { sond: 2, cred: 1, coh: 3, integ: -2 },
        result: "Le message mobilise vos troupes. Les manifestants, eux, se sentent pris en otage."
      }
    ]
  },
  {
    id: "a3_jeunes", date: "18 avr.", from: "ines",
    text: [
      "Les instituts prévoient 45 % d’abstention chez les 18-25 ans.",
      "Si on les mobilise, on peut gagner deux ou trois points. Une idée ?"
    ],
    choices: [
      {
        text: "Un grand concert gratuit et un appel des influenceurs.",
        fx: { treso: -12, sond: 5, cred: -2 },
        result: "Cent mille personnes au concert, des millions de vues. Les éditorialistes parlent de « politique spectacle ».",
        news: "Concert géant pour {nom} : les jeunes au rendez-vous"
      },
      {
        text: "Je promets une allocation d’autonomie pour tous les 18-25 ans.",
        fx: { sond: 7, cred: -7 },
        promise: "Allocation d’autonomie pour les 18-25 ans",
        result: "La mesure enthousiasme les campus. Coût estimé : 20 milliards par an. Les économistes s’étranglent."
      },
      {
        text: "Trois heures en direct sur Twitch, sans filtre ni communicant.",
        fx: { sond: 3, cred: 3, coh: -1 },
        result: "Vous vous faites malmener par le chat, mais vous tenez bon. Le format plaît. Inès a perdu cinq ans d’espérance de vie."
      }
    ]
  },
  {
    id: "a3_debat", date: "20 avr.", from: "antoine",
    text: [
      "Le débat d’entre-deux-tours. Vous face à Delmas. Quinze millions de téléspectateurs.",
      "C’est souvent là que tout se joue. Comment voulez-vous l’aborder ?"
    ],
    choices: [
      {
        text: "Calme, précis, présidentiel.",
        fx: { cred: 7, sond: 3 },
        result: "Delmas s’agace, vous restez de marbre. Les sondages flash vous donnent légèrement vainqueur."
      },
      {
        text: "Offensif : je démonte son bilan point par point.",
        fx: { sond: 6, cred: -3, coh: 3 },
        result: "Un combat de boxe. Vos militants exultent, les indécis grimacent.",
        news: "Débat musclé entre {nom} et Victor Delmas"
      },
      {
        text: "Je sors enfin le dossier luxembourgeois.",
        condition: s => s.flags.has("dossier_garde"),
        fx: { sond: 10, cred: -4, integ: -15 },
        result: "Delmas devient livide. Le coup est dévastateur… et vous avez renoncé à tout ce que vous défendiez jusqu’ici.",
        news: "Coup de théâtre : {nom} accuse Delmas d’évasion fiscale en direct"
      }
    ]
  },
  {
    id: "a3_scandale", date: "21 avr.", from: "lenoir",
    condition: s => s.flags.has("scandale_declenche"),
    text: [
      "{titre}, Thomas Lenoir, du Canard enchaîné. Nous publions demain six pages sur le financement de votre campagne.",
      s => {
        const faits = [];
        if (s.flags.has("koval")) faits.push("les dons fractionnés du promoteur Serge Koval");
        if (s.flags.has("cabinet")) faits.push("les méthodes du « cabinet de conseil aux élus »");
        if (s.flags.has("lobby")) faits.push("l’accord avec les laboratoires pharmaceutiques");
        if (s.flags.has("fuite")) faits.push("l’origine de la fuite sur Victor Delmas");
        if (s.flags.has("reveil")) faits.push("les financements du Collectif Réveil");
        if (s.flags.has("baudoin")) faits.push("votre pacte avec Charles-Henri Baudoin");
        if (!faits.length) faits.push("plusieurs irrégularités dans vos comptes de campagne");
        return "Nous avons des documents sur " + faits.join(", ") + ".";
      },
      "Le parquet national financier a été saisi. Trois jours avant le vote. Un commentaire ?"
    ],
    choices: [
      {
        text: "Je nie tout en bloc et je dénonce un complot.",
        fx: { sond: -30, cred: -30 },
        ending: "scandale",
        result: "Vos dénégations tiennent dix-huit heures. Puis Claire Vasseur est placée en garde à vue."
      },
      {
        text: "Je me retire de la course.",
        fx: { sond: -40 },
        ending: "scandale",
        result: "Vous annoncez votre retrait depuis votre QG désert. Les caméras filment des militants en larmes."
      }
    ]
  },
  {
    id: "a3_final", date: "22 avr.", from: "antoine",
    text: [
      "Dernier meeting ce soir. Après, c’est le silence électoral.",
      "Un seul message à graver dans les têtes. Lequel ?"
    ],
    choices: [
      {
        text: "L’espoir : « Le meilleur est devant nous. »",
        fx: { sond: 3, coh: 3 },
        result: "La salle chante. Pour la première fois de la campagne, vous avez l’impression que quelque chose se passe."
      },
      {
        text: "La peur : « Si Delmas passe, tout s’effondre. »",
        fx: { sond: 5, cred: -2, integ: -5 },
        result: "Le message porte, surtout chez les plus âgés. Il laissera des traces dans un pays déjà fracturé."
      },
      {
        text: "Le rassemblement : « Je serai {lepres} de tous les Français. »",
        fx: { sond: 2, cred: 4 },
        result: "Un discours sobre, rassembleur. Les indécis apprécient, les militants auraient voulu plus de feu."
      }
    ]
  }
];

const ACTS = [
  {
    num: "I", name: "L’Hiver", sub: "La course aux 500 parrainages",
    period: "Janvier – Mars 2027",
    objective: "Réunir au moins 500 parrainages d’élus avant la clôture du 4 mars.",
    events: ACT1,
    poolPick: 2
  },
  {
    num: "II", name: "Le Printemps", sub: "La tempête médiatique",
    period: "Mars – Avril 2027",
    objective: "Finir dans les deux premiers au premier tour du 10 avril.",
    events: ACT2,
    poolPick: 2
  },
  {
    num: "III", name: "L’Entre-deux-tours", sub: "Le sprint final",
    period: "11 – 24 avril 2027",
    objective: "Rassembler au-delà de son camp pour dépasser 50 % le 24 avril.",
    events: ACT3
  }
];

/* ------------------------------------------------------------------ */
/* FINS                                                                */
/* ------------------------------------------------------------------ */
const ENDINGS = {
  victoire_absolue: {
    tone: "win", emoji: "🇫🇷",
    title: "La Victoire Absolue",
    text: s => [
      `24 avril, 20 h 00. Votre visage apparaît sur tous les écrans : ${s.round2.you.toFixed(1).replace(".", ",")} %.`,
      "Vous n’avez rien vendu, rien renié. Pour la première fois depuis longtemps, des millions de Français disent avoir voté « pour » quelqu’un, et non « contre ».",
      "Sur le perron de l’Élysée, vous savez que le plus dur commence : gouverner sans trahir."
    ]
  },
  pacte: {
    tone: "dark", emoji: "😈",
    title: "Le Pacte avec le Diable",
    text: s => [
      `Élu${s.civ === "F" ? "e" : ""} avec ${s.round2.you.toFixed(1).replace(".", ",")} %. Le champagne coule à flots au QG.`,
      "Mais dès la première semaine, les factures arrivent : " +
        (s.flags.has("baudoin") ? "Baudoin réclame ses nominations, " : "") +
        (s.flags.has("lobby") ? "les laboratoires rappellent leurs « amis », " : "") +
        (s.flags.has("koval") ? "Serge Koval attend son permis de construire, " : "") +
        (s.flags.has("castagnet") ? "Castagnet s’installe à Matignon et gouverne à votre place, " : "") +
        "et vos promesses s’empilent sur un budget impossible.",
      "Un mois après votre investiture, le pays est en grève. Sur les pancartes, vos propres slogans de campagne, barrés en rouge."
    ]
  },
  victoire: {
    tone: "win", emoji: "🏛️",
    title: "Une Victoire au goût amer",
    text: s => [
      `Élu${s.civ === "F" ? "e" : ""} avec ${s.round2.you.toFixed(1).replace(".", ",")} %. Vous avez gagné.`,
      "Vous avez fait des compromis, quelques promesses de trop, quelques arrangements que vous préféreriez oublier. Rien d’irréparable… pour l’instant.",
      "Le quinquennat commence avec une majorité fragile et des alliés qui attendent leur dû."
    ]
  },
  honorable: {
    tone: "neutral", emoji: "🕊️",
    title: "La Défaite Honorable",
    text: s => [
      `${s.round2.you.toFixed(1).replace(".", ",")} %. Il a manqué un souffle.`,
      "Victor Delmas sera président. Mais votre discours de défaite, digne et combatif, est salué jusque dans les rangs adverses.",
      "Le lendemain, vous êtes le leader incontesté de l’opposition. Rendez-vous dans cinq ans."
    ]
  },
  cuisante: {
    tone: "lose", emoji: "📉",
    title: "La Défaite Cuisante",
    text: s => [
      `${s.round2.you.toFixed(1).replace(".", ",")} %. Le verdict est sans appel.`,
      "Le front contre vous a fonctionné. Delmas est élu confortablement.",
      "Au QG, les cadres se disputent déjà votre héritage. Votre carrière nationale est probablement terminée."
    ]
  },
  elimine: {
    tone: "lose", emoji: "🗳️",
    title: "Éliminé{e} dès le premier tour",
    text: s => [
      `${s.round1.you.toFixed(1).replace(".", ",")} % des voix. ${s.round1.rank}e position.`,
      "Le second tour se jouera sans vous. Les télévisions coupent votre discours pour passer à ceux des qualifiés.",
      "Il faudra choisir qui soutenir… et à quel prix."
    ]
  },
  scandale: {
    tone: "dark", emoji: "🚨",
    title: "Le Scandale d’État",
    text: () => [
      "Trois jours avant le vote, vos magouilles financières font la une de tous les journaux.",
      "Retrait, défaite, perquisition au QG. Votre trésorière est mise en examen ; votre tour viendra.",
      "Les livres d’histoire retiendront votre nom, mais pas pour les raisons que vous espériez."
    ]
  },
  parrainages: {
    tone: "lose", emoji: "✍️",
    title: "La Porte Close",
    text: s => [
      `4 mars, minuit. ${s.parr} parrainages déposés. Il en fallait 500.`,
      "Le Conseil constitutionnel publie la liste officielle des candidats. Votre nom n’y figure pas.",
      "Votre campagne s’arrête avant même d’avoir commencé."
    ]
  },
  go_sondages: {
    tone: "lose", emoji: "📊",
    title: "L’Effondrement",
    text: () => [
      "Vos intentions de vote passent sous la barre des 2 %. Les médias cessent de vous inviter.",
      "Vos alliés vous demandent publiquement de vous retirer « pour éviter l’humiliation ». Vous finissez par les écouter."
    ]
  },
  go_tresorerie: {
    tone: "lose", emoji: "💸",
    title: "La Faillite",
    text: () => [
      "Les caisses sont vides. Les prestataires ne sont plus payés, les meetings sont annulés un à un.",
      "La banque refuse un nouveau prêt. Votre campagne s’éteint dans l’indifférence générale."
    ]
  },
  go_cohesion: {
    tone: "lose", emoji: "🧨",
    title: "La Mutinerie",
    text: () => [
      "Votre directeur de campagne démissionne en direct au 20 h, suivi de la moitié de l’équipe.",
      "Le Canard enchaîné publie vos échanges privés. Il ne reste plus personne pour porter votre candidature."
    ]
  },
  go_credibilite: {
    tone: "lose", emoji: "🤡",
    title: "Le Discrédit",
    text: () => [
      "Plus aucun journaliste ne prend vos propositions au sérieux. Chacune de vos interventions devient un mème.",
      "Vos promesses intenables ont eu raison de vous : vous êtes devenu{e} la caricature de ce que les Français détestent en politique."
    ]
  }
};
