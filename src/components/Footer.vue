<template>
  <footer class="app-footer page-inner">
    <div class="app-footer__inner">
      <div class="app-footer__pagetop">↑</div>
      <p class="app-footer__copyright">© Y 2022</p>
    </div>
  </footer>
</template>

<script>
const setPagetopButton = ()=>{
  const pagetopElement = document.querySelector('.app-footer__pagetop');
  pagetopElement.addEventListener('click', ()=>{
    window.scroll({top: 0, behavior: 'smooth'})
  });
  window.addEventListener('scroll', ()=>{
    if(window.pageYOffset > 400){
      pagetopElement.classList.add('is-show')
    }else{
      pagetopElement.classList.remove('is-show')
    }
  })
}
document.addEventListener('DOMContentLoaded', () => {
  setPagetopButton()
});
</script>
