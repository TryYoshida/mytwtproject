'use strict'

export default (elements, options, enterFunction, removeFunction) => {
  const doWhenIntersect = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-enter')
        if(enterFunction){
          enterFunction()
        }
      } else if(entry.target.classList.contains('is-enter')){
        entry.target.classList.add('is-leave')
        if(removeFunction){
          removeFunction()
        }
      } else {
        entry.target.classList.remove('is-enter')
      }
    });
  }
  const observer = new IntersectionObserver(doWhenIntersect, options)
  elements.forEach(element => {
    observer.observe(element)
  })

}