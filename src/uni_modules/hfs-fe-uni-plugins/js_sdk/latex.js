// #ifdef H5
window.previewImage = uni.previewImage
// #endif

export const latexRegex = '\\$\\$([^$]+?)\\$\\$|\\$([^$]+?)\\$'

export const characters = {
  '<img': '<img onclick="window.previewImage({urls: [this.src]})"',
  '&amp;': '&',
  '&nbsp;?': ' ',
  '\\$\\{\\^\\{?①\\}?\\}\\$': '<sup>①</sup>',
  '\\$\\{\\^\\{?②\\}?\\}\\$': '<sup>②</sup>',
  '\\$\\{\\^\\{?③\\}?\\}\\$': '<sup>③</sup>',
  '\\$\\{\\^\\{?④\\}?\\}\\$': '<sup>④</sup>',
  '\\$\\{\\^\\{?⑤\\}?\\}\\$': '<sup>⑤</sup>',
  '\\$\\{\\^\\{?⑥\\}?\\}\\$': '<sup>⑥</sup>',
  '\\$\\{\\^\\{?⑦\\}?\\}\\$': '<sup>⑦</sup>',
  '\\$\\{\\^\\{?⑧\\}?\\}\\$': '<sup>⑧</sup>',
  '\\$\\{\\^\\{?⑨\\}?\\}\\$': '<sup>⑨</sup>',
  '\\$\\{\\^\\{?⑩\\}?\\}\\$': '<sup>⑩</sup>',
  '<dotted.*?>': '',
}

export const cjkMark = {
  '℃': '^\\circ\\text{C}',
  '∶': ':',
  '，': ',',
  '、': '\\text{、}',
  '①': '\\textcircled{1}',
  '②': '\\textcircled{2}',
  '③': '\\textcircled{3}',
  '④': '\\textcircled{4}',
  '⑤': '\\textcircled{5}',
  '⑥': '\\textcircled{6}',
  '⑦': '\\textcircled{7}',
  '⑧': '\\textcircled{8}',
  '⑨': '\\textcircled{9}',
  '⑩': '\\textcircled{10}',
  'Ⅰ': '\\text{I}',
  'Ⅱ': '\\text{II}',
  'Ⅲ': '\\text{III}',
  'Ⅳ': '\\text{IV}',
  'Ⅴ': '\\text{V}',
  'Ⅵ': '\\text{VI}',
  'Ⅶ': '\\text{VII}',
  'Ⅷ': '\\text{VIII}',
  'Ⅸ': '\\text{IX}',
  'Ⅹ': '\\text{X}',
  '◦': '\\circ',
}
