export type Aksara = {
  char: string;
  latin: string;
  title: string;
  note: string;
  kind?: "rarangken";
};

export type SentenceExercise = Aksara & {
  words: string[];
  aksaraWords: string[];
  choices: string[];
  hideSpeaker?: boolean;
};

export const AKSARA_SWARA: Aksara[] = [
  {
    char: "\u1B83",
    latin: "a",
    title: "Swara A",
    note: "Aksara swara dipaké keur sora vokal mandiri.",
  },
  {
    char: "\u1B84",
    latin: "i",
    title: "Swara I",
    note: "Sora i nangtung sorangan tanpa huruf dasar.",
  },
  { char: "\u1B85", latin: "u", title: "Swara U", note: "Sora u minangka aksara vokal mandiri." },
  {
    char: "\u1B86",
    latin: "\u00E9",
    title: "Swara \u00C9",
    note: "Sora \u00E9 kawas dina kecap enak.",
  },
  { char: "\u1B87", latin: "o", title: "Swara O", note: "Sora o minangka aksara vokal mandiri." },
  {
    char: "\u1B88",
    latin: "e",
    title: "Swara E",
    note: "Sora e pepet nu mindeng muncul dina basa Sunda.",
  },
  { char: "\u1B89", latin: "eu", title: "Swara Eu", note: "Sora eu has dina basa Sunda." },
];

export const AKSARA_NGALAGENA: Aksara[] = [
  {
    char: "\u1B8A",
    latin: "ka",
    title: "Ngalagena Ka",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B8C",
    latin: "ga",
    title: "Ngalagena Ga",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B8D",
    latin: "nga",
    title: "Ngalagena Nga",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B8E",
    latin: "ca",
    title: "Ngalagena Ca",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B8F",
    latin: "ja",
    title: "Ngalagena Ja",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B91",
    latin: "nya",
    title: "Ngalagena Nya",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B95",
    latin: "pa",
    title: "Ngalagena Pa",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B98",
    latin: "ba",
    title: "Ngalagena Ba",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B99",
    latin: "ma",
    title: "Ngalagena Ma",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B92",
    latin: "ta",
    title: "Ngalagena Ta",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B93",
    latin: "da",
    title: "Ngalagena Da",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B94",
    latin: "na",
    title: "Ngalagena Na",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B9A",
    latin: "ya",
    title: "Ngalagena Ya",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B9B",
    latin: "ra",
    title: "Ngalagena Ra",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B9C",
    latin: "la",
    title: "Ngalagena La",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B9D",
    latin: "wa",
    title: "Ngalagena Wa",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B9E",
    latin: "sa",
    title: "Ngalagena Sa",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1BA0",
    latin: "ha",
    title: "Ngalagena Ha",
    note: "Huruf dasar jeung sora a bawaan.",
  },
  {
    char: "\u1B96",
    latin: "fa",
    title: "Ngalagena Fa",
    note: "Huruf serepan keur sora fa.",
  },
  {
    char: "\u1B8B",
    latin: "qa",
    title: "Ngalagena Qa",
    note: "Huruf serepan keur sora qa.",
  },
  {
    char: "\u1B97",
    latin: "va",
    title: "Ngalagena Va",
    note: "Huruf serepan keur sora va.",
  },
  {
    char: "\u1B9F",
    latin: "xa",
    title: "Ngalagena Xa",
    note: "Huruf serepan keur sora xa.",
  },
  {
    char: "\u1B90",
    latin: "za",
    title: "Ngalagena Za",
    note: "Huruf serepan keur sora za.",
  },
];

export const RARANGKEN: Aksara[] = [
  {
    char: "\u1BA6\u1B8A",
    latin: "k\u00E9",
    title: "Pan\u00E9l\u00E9ng",
    note: "Ngaran rarangken: Pan\u00E9l\u00E9ng. Ngarobah sora ka jadi k\u00E9.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1B80",
    latin: "kang",
    title: "Panyecek",
    note: "Ngaran rarangken: Panyecek. Nambahkeun sora ng di tungtung aksara.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA7",
    latin: "ko",
    title: "Panolong",
    note: "Ngaran rarangken: Panolong. Ngarobah sora ka jadi ko.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA1",
    latin: "kya",
    title: "Pamingkal",
    note: "Ngaran rarangken: Pamingkal. Nambahkeun sora y di tengah aksara.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1B82",
    latin: "kah",
    title: "Pangwisad",
    note: "Ngaran rarangken: Pangwisad. Nambahkeun sora h di tungtung aksara.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BAA",
    latin: "k",
    title: "Pama\u00E9h",
    note: "Ngaran rarangken: Pama\u00E9h. Ngaleungitkeun sora a dina aksara.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1B81",
    latin: "kar",
    title: "Panglayar",
    note: "Ngaran rarangken: Panglayar. Nambahkeun sora r di tungtung aksara.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA4",
    latin: "ki",
    title: "Panghulu",
    note: "Ngaran rarangken: Panghulu. Ngarobah sora ka jadi ki.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA8",
    latin: "ke",
    title: "Pamepet",
    note: "Ngaran rarangken: Pamepet. Ngarobah sora ka jadi ke.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA9",
    latin: "keu",
    title: "Paneuleung",
    note: "Ngaran rarangken: Paneuleung. Ngarobah sora ka jadi keu.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA5",
    latin: "ku",
    title: "Panyuku",
    note: "Ngaran rarangken: Panyuku. Ngarobah sora ka jadi ku.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA3",
    latin: "kla",
    title: "Panyiku",
    note: "Ngaran rarangken: Panyiku. Nambahkeun sora l di tengah aksara.",
    kind: "rarangken",
  },
  {
    char: "\u1B8A\u1BA2",
    latin: "kra",
    title: "Panyakra",
    note: "Ngaran rarangken: Panyakra. Nambahkeun sora r di tengah aksara.",
    kind: "rarangken",
  },
];

export const AKSARA_ANGKA: Aksara[] = [
  { char: "\u1BB0", latin: "nol", title: "Angka Nol", note: "Angka nol dina aksara Sunda." },
  { char: "\u1BB1", latin: "hiji", title: "Angka Hiji", note: "Angka hiji dina aksara Sunda." },
  { char: "\u1BB2", latin: "dua", title: "Angka Dua", note: "Angka dua dina aksara Sunda." },
  { char: "\u1BB3", latin: "tilu", title: "Angka Tilu", note: "Angka tilu dina aksara Sunda." },
  { char: "\u1BB4", latin: "opat", title: "Angka Opat", note: "Angka opat dina aksara Sunda." },
  { char: "\u1BB5", latin: "lima", title: "Angka Lima", note: "Angka lima dina aksara Sunda." },
  { char: "\u1BB6", latin: "genep", title: "Angka Genep", note: "Angka genep dina aksara Sunda." },
  { char: "\u1BB7", latin: "tujuh", title: "Angka Tujuh", note: "Angka tujuh dina aksara Sunda." },
  {
    char: "\u1BB8",
    latin: "dalapan",
    title: "Angka Dalapan",
    note: "Angka dalapan dina aksara Sunda.",
  },
  {
    char: "\u1BB9",
    latin: "salapan",
    title: "Angka Salapan",
    note: "Angka salapan dina aksara Sunda.",
  },
];

export const AKSARA_DASAR: Aksara[] = [...AKSARA_SWARA, ...AKSARA_NGALAGENA];

export const AKSARA_SWARA_ANGKA: Aksara[] = [...AKSARA_SWARA, ...AKSARA_ANGKA];

export const KATA_BACAAN: Aksara[] = [
  {
    char: "\u1B98\u1BA8\u1B94\u1BA8\u1B81",
    latin: "bener",
    title: "Pamepet - bener",
    note: "Conto kecap keur mikawanoh rarangken Pamepet.",
  },
  {
    char: "\u1B98\u1BA9\u1B9B\u1B80",
    latin: "beurang",
    title: "Panglayar - beurang",
    note: "Conto kecap tina daptar latihan rarangken.",
  },
  {
    char: "\u1B98\u1BA5\u1B93\u1B8A\u1BAA",
    latin: "budak",
    title: "Panyecek - budak",
    note: "Conto kecap tina daptar latihan rarangken.",
  },
  {
    char: "\u1B8A\u1BA2\u1BA4\u1B9D\u1BA4\u1B9C\u1BAA",
    latin: "kriwil",
    title: "Panyakra - kriwil",
    note: "Conto kecap tina daptar latihan rarangken.",
  },
  {
    char: "\u1BA0\u1BA4\u1B8F\u1BA4",
    latin: "hiji",
    title: "Panyiku - hiji",
    note: "Conto kecap tina daptar latihan rarangken.",
  },
  {
    char: "\u1B98\u1BA6\u1B83\u1B9E\u1BAA",
    latin: "b\u00E9as",
    title: "Pan\u00E9l\u00E9ng - b\u00E9as",
    note: "Conto kecap keur mikawanoh rarangken Pan\u00E9l\u00E9ng.",
  },
  {
    char: "\u1B98\u1BA7\u1B98\u1BA7\u1B8A\u1BA7",
    latin: "boboko",
    title: "Panolong - boboko",
    note: "Conto kecap keur mikawanoh rarangken Panolong.",
  },
  {
    char: "\u1B9E\u1BA1\u1BA5\u1B8A\u1BA5\u1B81",
    latin: "syukur",
    title: "Pamingkal - syukur",
    note: "Conto kecap keur mikawanoh rarangken Pamingkal.",
  },
  {
    char: "\u1B84\u1B99\u1B82",
    latin: "imah",
    title: "Pangwisad - imah",
    note: "Conto kecap keur mikawanoh rarangken Pangwisad.",
  },
  {
    char: "\u1B9D\u1B8A\u1BAA\u1B92\u1BA5",
    latin: "waktu",
    title: "Pama\u00E9h - waktu",
    note: "Conto kecap keur mikawanoh rarangken Pama\u00E9h.",
  },
  {
    char: "\u1B8A\u1BA5\u1B93",
    latin: "kuda",
    title: "Kecap Kuda",
    note: "Latihan maca kecap pondok sanggeus mikawanoh rarangken.",
  },
  {
    char: "\u1B98\u1B95\u1B8A\u1BAA",
    latin: "bapak",
    title: "Kecap Bapak",
    note: "Tengetan tanda pamaéh keur nutup sora tungtung kecap.",
  },
  {
    char: "\u1B9E\u1B95\u1BA4",
    latin: "sapi",
    title: "Kecap Sapi",
    note: "Gabungkeun aksara dasar jeung rarangken jadi kecap.",
  },
  {
    char: "\u1B98\u1BA5\u1B99\u1BA4",
    latin: "bumi",
    title: "Kecap Bumi",
    note: "Latihan maca kecap jeung robahan sora u jeung i.",
  },
];

export const KALIMAT_SEDERHANA: SentenceExercise[] = [
  {
    char: "\u1B98\u1B95\u1B8A\u1BAA \u1B99\u1B8E",
    latin: "bapak maca",
    title: "Kalimah Bapak Maca",
    note: "Maca hartina maca. Susun kecap luyu jeung aksara nu muncul.",
    words: ["bapak", "maca"],
    aksaraWords: ["\u1B98\u1B95\u1B8A\u1BAA", "\u1B99\u1B8E"],
    choices: ["bapak", "maca", "kuda", "aya"],
  },
  {
    char: "\u1B83\u1B9A \u1B8A\u1BA5\u1B93",
    latin: "aya kuda",
    title: "Kalimah Aya Kuda",
    note: "Susun kalimah pondok tina audio anyar.",
    words: ["aya", "kuda"],
    aksaraWords: ["\u1B83\u1B9A", "\u1B8A\u1BA5\u1B93"],
    choices: ["aya", "kuda", "sapi", "bapak"],
  },
  {
    char: "\u1B83\u1B9A \u1B9E\u1B95\u1BA4",
    latin: "aya sapi",
    title: "Kalimah Aya Sapi",
    note: "Susun kalimah pondok tina audio anyar.",
    words: ["aya", "sapi"],
    aksaraWords: ["\u1B83\u1B9A", "\u1B9E\u1B95\u1BA4"],
    choices: ["aya", "sapi", "kuda", "budak"],
  },
  {
    char: "\u1B98\u1BA5\u1B93\u1BA4 \u1B99\u1B8E",
    latin: "budi maca",
    title: "Kalimah Budi Maca",
    note: "Soal pondok anyar tina audio panganyarna.",
    words: ["budi", "maca"],
    aksaraWords: ["\u1B98\u1BA5\u1B93\u1BA4", "\u1B99\u1B8E"],
    choices: ["budi", "maca", "bapak", "aya"],
  },
  {
    char: "\u1BB1\u1BB7 \u1B83\u1B8C\u1BA5\u1B9E\u1BAA\u1B92\u1BA5\u1B9E\u1BAA \u1BB1\u1BB9\u1BB4\u1BB5",
    latin: "17 agustus 1945",
    title: "Kalimah 17 Agustus 1945",
    note: "Latihan maca kalimah angka nu masih pondok.",
    words: ["17", "agustus", "1945"],
    aksaraWords: [
      "\u1BB1\u1BB7",
      "\u1B83\u1B8C\u1BA5\u1B9E\u1BAA\u1B92\u1BA5\u1B9E\u1BAA",
      "\u1BB1\u1BB9\u1BB4\u1BB5",
    ],
    choices: ["17", "agustus", "1945", "12", "tilu"],
  },
  {
    char: "\u1B83\u1B94\u1B8A\u1BAA\u1B94 \u1BB3 \u1B84\u1B94\u1BAA\u1B8E\u1BA5\u1B94 \u1BB1\u1BB1",
    latin: "anakna 3 incuna 11",
    title: "Kalimah Anakna 3 Incuna 11",
    note: "Campuran kecap jeung angka pikeun latihan salajengna.",
    words: ["anakna", "3", "incuna", "11"],
    aksaraWords: [
      "\u1B83\u1B94\u1B8A\u1BAA\u1B94",
      "\u1BB3",
      "\u1B84\u1B94\u1BAA\u1B8E\u1BA5\u1B94",
      "\u1BB1\u1BB1",
    ],
    choices: ["anakna", "3", "incuna", "11", "kuda", "bumi"],
  },
  {
    char: "\u1B98\u1B95\u1B8A\u1BAA \u1B83\u1B9A \u1B93\u1BA4 \u1B98\u1BA5\u1B99\u1BA4",
    latin: "bapak aya di bumi",
    title: "Kalimah Bapak Aya Di Bumi",
    note: "Susun kalimah anyar luyu jeung rekaman panganyarna.",
    words: ["bapak", "aya", "di", "bumi"],
    aksaraWords: [
      "\u1B98\u1B95\u1B8A\u1BAA",
      "\u1B83\u1B9A",
      "\u1B93\u1BA4",
      "\u1B98\u1BA5\u1B99\u1BA4",
    ],
    choices: ["bapak", "aya", "di", "bumi", "sapi", "maca"],
  },
  {
    char: "\u1B98\u1BA5\u1B93\u1B8A\u1BAA \u1B83\u1B9A \u1B93\u1BA4 \u1B98\u1BA5\u1B99\u1BA4",
    latin: "budak aya di bumi",
    title: "Kalimah Budak Aya Di Bumi",
    note: "Susun kalimah anyar luyu jeung rekaman panganyarna.",
    words: ["budak", "aya", "di", "bumi"],
    aksaraWords: [
      "\u1B98\u1BA5\u1B93\u1B8A\u1BAA",
      "\u1B83\u1B9A",
      "\u1B93\u1BA4",
      "\u1B98\u1BA5\u1B99\u1BA4",
    ],
    choices: ["budak", "aya", "di", "bumi", "bapak", "maca"],
  },
  {
    char: "\u1B8A\u1BA9\u1B81 \u1B9E\u1BA7\u1B9C\u1B92\u1BAA \u1B99\u1B8E \u1B9E\u1BA1\u1BA0\u1B93\u1B92\u1BAA",
    latin: "keur solat maca syahadat",
    title: "Kalimah Keur Solat Maca Syahadat",
    note: "Susun kalimah panjang tina conto anyar.",
    words: ["keur", "solat", "maca", "syahadat"],
    aksaraWords: [
      "\u1B8A\u1BA9\u1B81",
      "\u1B9E\u1BA7\u1B9C\u1B92\u1BAA",
      "\u1B99\u1B8E",
      "\u1B9E\u1BA1\u1BA0\u1B93\u1B92\u1BAA",
    ],
    choices: ["keur", "solat", "maca", "syahadat", "budi", "imah"],
  },
  {
    char: "\u1B8E\u1BA5\u1B8A\u1BA9\u1B9C\u1B8A\u1BAA \u1B9C\u1BA9\u1B9D\u1BA9\u1B80 \u1B8E\u1BA5\u1B8A\u1BA9\u1B9C\u1B8A\u1BAA \u1B9C\u1B99\u1BAA\u1B95\u1BA4\u1B80",
    latin: "cukeulak leuweung cukeulak lamping",
    title: "Kalimah Cukeulak Leuweung Cukeulak Lamping",
    note: "Aya kecap nu sarua dua kali, jadi susunna kudu leuwih taliti.",
    words: ["cukeulak", "leuweung", "cukeulak", "lamping"],
    aksaraWords: [
      "\u1B8E\u1BA5\u1B8A\u1BA9\u1B9C\u1B8A\u1BAA",
      "\u1B9C\u1BA9\u1B9D\u1BA9\u1B80",
      "\u1B8E\u1BA5\u1B8A\u1BA9\u1B9C\u1B8A\u1BAA",
      "\u1B9C\u1B99\u1BAA\u1B95\u1BA4\u1B80",
    ],
    choices: ["cukeulak", "leuweung", "cukeulak", "lamping", "maca", "sapi"],
  },
  {
    char: "\u1B83\u1B9A \u1BA0\u1BA4\u1B8F\u1BA4 \u1B8A\u1BA5\u1B93 \u1B93\u1BA4 \u1B8A\u1B94\u1BAA\u1B93\u1B80",
    latin: "aya hiji kuda di kandang",
    title: "Kalimah Aya Hiji Kuda Di Kandang",
    note: "Susun kalimah leuwih panjang tina audio anyar.",
    words: ["aya", "hiji", "kuda", "di", "kandang"],
    aksaraWords: [
      "\u1B83\u1B9A",
      "\u1BA0\u1BA4\u1B8F\u1BA4",
      "\u1B8A\u1BA5\u1B93",
      "\u1B93\u1BA4",
      "\u1B8A\u1B94\u1BAA\u1B93\u1B80",
    ],
    choices: ["aya", "hiji", "kuda", "di", "kandang", "sapi", "bumi"],
  },
  {
    char: "\u1B95\u1BA5\u1B8A\u1BA5\u1B9C\u1BAA \u1BB1\u1BB0 \u1B9C\u1BA9\u1B9D\u1BA4\u1B82 \u1BB1\u1BB6 \u1B99\u1BA8\u1B94\u1BA4\u1B92\u1BAA",
    latin: "pukul 10 leuwih 16 menit",
    title: "Kalimah Pukul 10 Leuwih 16 Menit",
    note: "Gabungan waktu jeung angka pikeun nambahan tangtangan.",
    words: ["pukul", "10", "leuwih", "16", "menit"],
    aksaraWords: [
      "\u1B95\u1BA5\u1B8A\u1BA5\u1B9C\u1BAA",
      "\u1BB1\u1BB0",
      "\u1B9C\u1BA9\u1B9D\u1BA4\u1B82",
      "\u1BB1\u1BB6",
      "\u1B99\u1BA8\u1B94\u1BA4\u1B92\u1BAA",
    ],
    choices: ["pukul", "10", "leuwih", "16", "menit", "waktu", "beurang"],
  },
  {
    char: "\u1B98\u1B95\u1B8A\u1BAA \u1B99\u1B8E \u1B93\u1BA4\u1B94 \u1B9D\u1B8A\u1BAA\u1B92\u1BA5 \u1B98\u1BA9\u1B9B\u1B80",
    latin: "bapak maca dina waktu beurang",
    title: "Kalimah Bapak Maca Dina Waktu Beurang",
    note: "Susun kalimah luyu jeung rekaman panganyarna.",
    words: ["bapak", "maca", "dina", "waktu", "beurang"],
    aksaraWords: [
      "\u1B98\u1B95\u1B8A\u1BAA",
      "\u1B99\u1B8E",
      "\u1B93\u1BA4\u1B94",
      "\u1B9D\u1B8A\u1BAA\u1B92\u1BA5",
      "\u1B98\u1BA9\u1B9B\u1B80",
    ],
    choices: ["bapak", "maca", "dina", "waktu", "beurang", "budak", "bumi"],
  },
  {
    char: "\u1B98\u1BA5\u1B93\u1B8A\u1BAA \u1B99\u1B8E \u1B93\u1BA4\u1B94 \u1B9D\u1B8A\u1BAA\u1B92\u1BA5 \u1B98\u1BA9\u1B9B\u1B80",
    latin: "budak maca dina waktu beurang",
    title: "Kalimah Budak Maca Dina Waktu Beurang",
    note: "Susun kalimah luyu jeung rekaman panganyarna.",
    words: ["budak", "maca", "dina", "waktu", "beurang"],
    aksaraWords: [
      "\u1B98\u1BA5\u1B93\u1B8A\u1BAA",
      "\u1B99\u1B8E",
      "\u1B93\u1BA4\u1B94",
      "\u1B9D\u1B8A\u1BAA\u1B92\u1BA5",
      "\u1B98\u1BA9\u1B9B\u1B80",
    ],
    choices: ["budak", "maca", "dina", "waktu", "beurang", "bapak", "aya"],
  },
  {
    char: "\u1BB1\u1BB2 \u1B93\u1BA4\u1B98\u1B8C\u1BA4 \u1BB4 \u1B99\u1B82 \u1B91 \u1B92\u1BA4\u1B9C\u1BA5",
    latin: "12 dibagi 4 mah nya tilu",
    title: "Kalimah 12 Dibagi 4 Mah Nya Tilu",
    note: "Soal itungan pondok keur nguji maca kalimah campuran.",
    words: ["12", "dibagi", "4", "mah", "nya", "tilu"],
    aksaraWords: [
      "\u1BB1\u1BB2",
      "\u1B93\u1BA4\u1B98\u1B8C\u1BA4",
      "\u1BB4",
      "\u1B99\u1B82",
      "\u1B91",
      "\u1B92\u1BA4\u1B9C\u1BA5",
    ],
    choices: ["12", "dibagi", "4", "mah", "nya", "tilu", "17"],
  },
  {
    char: "\u1BA0\u1B81\u1B8C \u1B88\u1B94\u1BAA\u1B93\u1BA7\u1B8C\u1BAA \u1B92\u1BA8\u1B82 \u1BB3\u1BB2 \u1B9B\u1BA8\u1B98\u1BA5 \u1B9E\u1B8A\u1BA4\u1B9C\u1BA7\u1B94",
    latin: "harga endog teh 32 rebu sakilona",
    title: "Kalimah Harga Endog Teh 32 Rebu Sakilona",
    note: "Kalimah itungan belanja keur nambahan variasi soal.",
    words: ["harga", "endog", "teh", "32", "rebu", "sakilona"],
    aksaraWords: [
      "\u1BA0\u1B81\u1B8C",
      "\u1B88\u1B94\u1BAA\u1B93\u1BA7\u1B8C\u1BAA",
      "\u1B92\u1BA8\u1B82",
      "\u1BB3\u1BB2",
      "\u1B9B\u1BA8\u1B98\u1BA5",
      "\u1B9E\u1B8A\u1BA4\u1B9C\u1BA7\u1B94",
    ],
    choices: ["harga", "endog", "teh", "32", "rebu", "sakilona", "gula"],
  },
  {
    char: "\u1B99\u1BA9\u1B9C\u1BA4 \u1B8C\u1BA5\u1B9C \u1BB2 \u1B8A\u1BA4\u1B9C\u1BA7 \u1B93\u1BA4\u1B92\u1B99\u1BAA\u1B98\u1B82 \u1B92\u1B9B\u1BA4\u1B8C\u1BA5 \u1BB4 \u1B8A\u1BA4\u1B9C\u1BA7",
    latin: "meuli gula 2 kilo ditambah tarigu 4 kilo",
    title: "Kalimah Meuli Gula 2 Kilo Ditambah Tarigu 4 Kilo",
    note: "Soal panjang nu eusina campuran kecap jeung angka.",
    words: ["meuli", "gula", "2", "kilo", "ditambah", "tarigu", "4", "kilo"],
    aksaraWords: [
      "\u1B99\u1BA9\u1B9C\u1BA4",
      "\u1B8C\u1BA5\u1B9C",
      "\u1BB2",
      "\u1B8A\u1BA4\u1B9C\u1BA7",
      "\u1B93\u1BA4\u1B92\u1B99\u1BAA\u1B98\u1B82",
      "\u1B92\u1B9B\u1BA4\u1B8C\u1BA5",
      "\u1BB4",
      "\u1B8A\u1BA4\u1B9C\u1BA7",
    ],
    choices: ["meuli", "gula", "2", "kilo", "ditambah", "tarigu", "4", "kilo", "rebu"],
  },
  {
    char: "\u1B95\u1BA9\u1B94\u1BAA\u1B92\u1BA9\u1B94\u1BAA \u1B84\u1B93 \u1BB8\u1BB5 \u1B83\u1B9B\u1BA4 \u1B95\u1BA9\u1B94\u1BAA\u1B92\u1BA9\u1B94\u1BAA \u1B8C\u1BA4\u1B9C\u1B80 \u1BB9\u1BB0",
    latin: "peunteun ida 85 ari peunteun gilang 90",
    title: "Kalimah Peunteun Ida 85 Ari Peunteun Gilang 90",
    note: "Latihan maca kalimah panjang nu eusina babandingan angka.",
    words: ["peunteun", "ida", "85", "ari", "peunteun", "gilang", "90"],
    aksaraWords: [
      "\u1B95\u1BA9\u1B94\u1BAA\u1B92\u1BA9\u1B94\u1BAA",
      "\u1B84\u1B93",
      "\u1BB8\u1BB5",
      "\u1B83\u1B9B\u1BA4",
      "\u1B95\u1BA9\u1B94\u1BAA\u1B92\u1BA9\u1B94\u1BAA",
      "\u1B8C\u1BA4\u1B9C\u1B80",
      "\u1BB9\u1BB0",
    ],
    choices: ["peunteun", "ida", "85", "ari", "peunteun", "gilang", "90", "harga"],
  },
  {
    char: "\u1B83\u1B94\u1BA5\u1B8C\u1BA2\u1B82 \u1B98\u1B9A\u1B95\u1B9B \u1B95\u1BA2\u1BA5\u1B98\u1B92\u1BA4\u1B9E\u1BAA\u1B92",
    latin: "anugrah bayapara prubatista",
    title: "Kalimah Anugrah Bayapara Prubatista",
    note: "Susun kalimah anyar tina gambar conto.",
    words: ["anugrah", "bayapara", "prubatista"],
    aksaraWords: [
      "\u1B83\u1B94\u1BA5\u1B8C\u1BA2\u1B82",
      "\u1B98\u1B9A\u1B95\u1B9B",
      "\u1B95\u1BA2\u1BA5\u1B98\u1B92\u1BA4\u1B9E\u1BAA\u1B92",
    ],
    choices: ["anugrah", "bayapara", "prubatista", "waktu", "maca"],
  },
  {
    char: "\u1B9E\u1B80 \u1B95\u1B9B \u1B98\u1BA5\u1B9E\u1BA4\u1B9B \u1B98\u1B93\u1BA5\u1B8C \u1B99\u1BA0\u1B9B\u1B8F",
    latin: "sang para busira baduga maharaja",
    title: "Kalimah Sang Para Busira Baduga Maharaja",
    note: "Susun runtuyan kecapna luyu jeung aksara Sunda nu ditingalikeun.",
    words: ["sang", "para", "busira", "baduga", "maharaja"],
    aksaraWords: [
      "\u1B9E\u1B80",
      "\u1B95\u1B9B",
      "\u1B98\u1BA5\u1B9E\u1BA4\u1B9B",
      "\u1B98\u1B93\u1BA5\u1B8C",
      "\u1B99\u1BA0\u1B9B\u1B8F",
    ],
    choices: ["sang", "para", "busira", "baduga", "maharaja", "budak"],
  },
  {
    char: "\u1B85\u1B9B\u1B80 \u1B8A\u1BA5\u1B93\u1BA5 \u1B98\u1BA4\u1B9E \u1B99\u1B8E \u1B8F\u1BA9\u1B80 \u1B94\u1BA5\u1B9C\u1BA4\u1B9E\u1BAA \u1B83\u1B8A\u1BAA\u1B9E\u1B9B \u1B9E\u1BA5\u1B94\u1BAA\u1B93",
    latin: "urang kudu bisa maca jeung nulis aksara sunda",
    title: "Kalimah Urang Kudu Bisa Maca Jeung Nulis Aksara Sunda",
    note: "Kalimah panutup nu pangpanjangna pikeun nguji maca jeung nyusun runtuyan.",
    words: ["urang", "kudu", "bisa", "maca", "jeung", "nulis", "aksara", "sunda"],
    aksaraWords: [
      "\u1B85\u1B9B\u1B80",
      "\u1B8A\u1BA5\u1B93\u1BA5",
      "\u1B98\u1BA4\u1B9E",
      "\u1B99\u1B8E",
      "\u1B8F\u1BA9\u1B80",
      "\u1B94\u1BA5\u1B9C\u1BA4\u1B9E\u1BAA",
      "\u1B83\u1B8A\u1BAA\u1B9E\u1B9B",
      "\u1B9E\u1BA5\u1B94\u1BAA\u1B93",
    ],
    choices: ["urang", "kudu", "bisa", "maca", "jeung", "nulis", "aksara", "sunda", "budak"],
  },
];

export const LEVELS = [
  {
    id: 1,
    name: "Aksara Swara & Angka",
    desc: "Vokal mandiri jeung angka 0-9",
    items: AKSARA_SWARA_ANGKA,
  },
  { id: 2, name: "Aksara Ngalagena", desc: "Aksara dasar", items: AKSARA_NGALAGENA },
  {
    id: 3,
    name: "Rarangken & Maca Kecap",
    desc: "Tanda sora tuluy kecap pondok",
    items: [...RARANGKEN, ...KATA_BACAAN],
  },
  { id: 4, name: "Nyusun Kalimah", desc: "Kalimah basajan", items: KALIMAT_SEDERHANA },
];

export function getLearningLevel(level: number) {
  return LEVELS.find((item) => item.id === level) ?? LEVELS[0];
}

export function isSentenceExercise(item: Aksara): item is SentenceExercise {
  return "words" in item && "aksaraWords" in item && "choices" in item;
}

export const KATA: { aksara: string; latin: string }[] = KATA_BACAAN.map(({ char, latin }) => ({
  aksara: char,
  latin,
}));

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
