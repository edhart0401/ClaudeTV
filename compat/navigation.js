// IDs: 0 Settings, 1 Exit, 2–7 streaming cards, 8 PS4.
export function nextFocus(index,key){
 const directions={
  ArrowLeft:[0,0,2,2,3,5,5,6,4],
  ArrowRight:[1,1,3,4,8,6,7,8,8],
  ArrowUp:[0,1,0,0,1,2,3,4,1],
  ArrowDown:[2,8,5,6,7,5,6,7,8]
 };
 return directions[key]?directions[key][index]:index;
}
export function clockParts(hour,minute){return [('0'+hour).slice(-2),('0'+minute).slice(-2)];}
