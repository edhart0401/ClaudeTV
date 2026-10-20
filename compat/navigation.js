// IDs: 0 Settings, 1 Exit, 2–8 seven carousel services.
export function nextFocus(index,key,lastApp=2){
 if(index<2){
  if(key==='ArrowDown')return lastApp;
  if(key==='ArrowLeft')return 0;
  if(key==='ArrowRight')return 1;
  return index;
 }
 if(key==='ArrowLeft')return index===2?8:index-1;
 if(key==='ArrowRight')return index===8?2:index+1;
 if(key==='ArrowUp')return index<6?0:1;
 return index;
}
export function carouselStep(from,to){
 const distance=(to-from+7)%7;
 return distance>3?distance-7:distance;
}
