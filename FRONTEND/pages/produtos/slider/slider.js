/*
  ====================================
  SLIDER DE PRODUTOS
  ====================================
  
  Componente que controla o slider de imagens na página de produtos
  Permite navegação através de botões anterior/próximo
  Alterna entre slides escondendo e exibindo elements com classe "on"
*/

// Seleciona todos os slides (imagens) do slider
const slider = document.querySelectorAll('.slider');

// Seleciona o botão de navegação anterior
const btnPrev = document.getElementById('prev-button');

// Seleciona o botão de navegação próximo
const btnNext = document.getElementById('next-button');

// Índice do slide atual (começa no primeiro slide)
let currentSlide = 0;

/*
  Função que esconde todos os slides
  Remove a classe 'on' que deixa o slide visível
*/
function hideSlider() {
    slider.forEach(item => item.classList.remove('on'));
}

/*
  Função que exibe o slide atual
  Adiciona a classe 'on' ao slide do índice atual
*/
function showSlider() {
    slider[currentSlide].classList.add('on');
}

/* Event listener: botão próximo slide
   Clicando, vai para o próximo slide ou volta ao primeiro se for o último
*/
btnNext.addEventListener('click', function () {
    // Esconde o slide atual
    hideSlider();
    
    // Se é o último slide, volta ao primeiro; senão avança
    if (currentSlide == slider.length - 1) {
        currentSlide = 0;
    } else {
        currentSlide++;
    }
    
    // Exibe o novo slide
    showSlider();
})

/* Event listener: botão slide anterior
   Clicando, vai para o slide anterior ou vai ao último se for o primeiro
*/
btnPrev.addEventListener('click', function () {
    // Esconde o slide atual
    hideSlider();
    
    // Se é o primeiro slide, vai ao último; senão volta
    if (currentSlide == 0) {
        currentSlide = slider.length - 1;
    } else {
        currentSlide--;
    }
    
    // Exibe o novo slide
    showSlider();
})