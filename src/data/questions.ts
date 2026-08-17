import eatingImg from '../assets/eating.png';
import readingImg from '../assets/reading.png';
import swimmingImg from '../assets/swimming.png';
import appleImg from '../assets/apple.png';
import carImg from '../assets/car.png';
import catImg from '../assets/cat.png';
import treeImg from '../assets/tree.png';
import sunImg from '../assets/sun.png';

export interface Question {
  id: number;
  questionText: string;
  image: string | null;
  word: string;
  distractors: string[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    questionText: "ماذا يفعل؟",
    image: eatingImg,
    word: 'يأكل',
    distractors: ['يشرب', 'ينام', 'يجري']
  },
  {
    id: 2,
    questionText: "ماذا يفعل؟",
    image: readingImg,
    word: 'يقرأ',
    distractors: ['يكتب', 'يلعب', 'يغني']
  },
  {
    id: 3,
    questionText: "ماذا يفعل؟",
    image: swimmingImg,
    word: 'يسبح',
    distractors: ['يطير', 'يقفز', 'يركض']
  },
  {
    id: 4,
    questionText: "ما هذا؟",
    image: appleImg,
    word: 'تفاحة',
    distractors: ['موزة', 'برتقالة', 'بطيخ']
  },
  {
    id: 5,
    questionText: "ما هذا؟",
    image: carImg,
    word: 'سيارة',
    distractors: ['دراجة', 'قطار', 'طائرة']
  },
  {
    id: 6,
    questionText: "ما هذا؟",
    image: catImg,
    word: 'قطة',
    distractors: ['كلب', 'أرنب', 'أسد']
  },
  {
    id: 7,
    questionText: "ما هذا؟",
    image: treeImg,
    word: 'شجرة',
    distractors: ['زهرة', 'جبل', 'صخرة']
  },
  {
    id: 8,
    questionText: "ما هذا؟",
    image: sunImg,
    word: 'شمس',
    distractors: ['قمر', 'كوكب', 'نجمة']
  }
];
