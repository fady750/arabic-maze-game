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
  image: string;
  word: string;
  distractors: string[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    image: eatingImg,
    word: 'يأكل',
    distractors: ['يشرب', 'ينام', 'يجري']
  },
  {
    id: 2,
    image: readingImg,
    word: 'يقرأ',
    distractors: ['يكتب', 'يلعب', 'يغني']
  },
  {
    id: 3,
    image: swimmingImg,
    word: 'يسبح',
    distractors: ['يطير', 'يقفز', 'يركض']
  },
  {
    id: 4,
    image: appleImg,
    word: 'تفاحة',
    distractors: ['موزة', 'برتقالة', 'بطيخ']
  },
  {
    id: 5,
    image: carImg,
    word: 'سيارة',
    distractors: ['دراجة', 'قطار', 'طائرة']
  },
  {
    id: 6,
    image: catImg,
    word: 'قطة',
    distractors: ['كلب', 'أرنب', 'أسد']
  },
  {
    id: 7,
    image: treeImg,
    word: 'شجرة',
    distractors: ['زهرة', 'جبل', 'صخرة']
  },
  {
    id: 8,
    image: sunImg,
    word: 'شمس',
    distractors: ['قمر', 'كوكب', 'نجمة']
  }
];
