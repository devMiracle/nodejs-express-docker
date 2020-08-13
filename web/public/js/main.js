/* логика веб-клиента */
// установка обработчика события на стандартный объект Документ:
// "когда загрузка документа в браузер завершена"
document.addEventListener('DOMContentLoaded', function() {
  // массив для хранения локального списка моделей с данными о товарах
  let products = {
    data: []
  }
  // Определение функции рисования всех карточек
  function renderProducts (products) {
    //Готовим шаблон списка при помощи библиотеки Hogan
    let template = Hogan.compile(
      `{{#data}}
        <div class="col s12 xl6">
          <div class="card">
            <div class="card-image">
              {{#image}}
                <img src="{{image}}">
              {{/image}}
              {{^image}}
                <img src="../images/image_1.jpeg">
              {{/image}}
              <a data-productid={{id}} class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">delete</i></a>
            </div>
            <div class="card-content">
              <span class="card-title">{{title}}</span>
              <p>{{description}}</p>
            </div>
          </div>
        </div>
      {{/data}}
      {{^data}}
        Product List is Empty
      {{/data}}`
    )
    // Находим элемент основной разметки, внутрь которого нужно поместить
    // разметку карточек, заполненную данными
    let container = document.querySelector('#productsContainer > .row')
    // Заполняем шаблон данными и помещаем результат на веб-страницу
    container.innerHTML = template.render(products)
    document.querySelectorAll('.card a').forEach(deleteButton => {
      deleteButton.onclick = (ev) => {
        ev.preventDefault()
        // адрес конечной точки Товар на серверной логике
        const url = 'api/product/' + deleteButton.dataset.productid
        // заголовки для запроса по сети
        const requestData = {
          method: 'DELETE'
        }
        // объект запроса по сети
        const request = new Request(url, requestData)
        // выполнение запроса по сети: получить список описаний всех товаров
        fetch(request).then(function (response) {
          // из полученного отклика сервера извлечь код статуса
          // и передать для дальнейшей обработки
          return response.status
        }).then(function (statusCode) {
          // если в объекте отклика код статуса равен "no content"
          if (statusCode == 204) {
            // вызов функции получения массива описаний товаров
            fetchProducts()
          }
        }).catch(function (e) {
          // выводим окно сообщения об ошибке
          alert('Products fetching error: ' + e)
        })
      }
    })
  }
  // Определение функции получения данных и запуска рисования всех карточек
  function fetchProducts () {
    // адрес конечной точки Товар на серверной логике
    const url = 'api/product'
    // заголовки для запроса по сети
    const requestData = {
      method: 'GET'
    }
    // объект запроса по сети
    const request = new Request(url, requestData)
    // выполнение запроса по сети: получить список описаний всех товаров
    fetch(request).then(function (response) {
      // из полученного отклика сервера извлечь тело в формате json
      // и передать для дальнейшей обработки
      return response.json()
    }).then(function (response) {
      // если в распакованном объекте отклика есть непустой ключ data
      // и длинна массива в его значении - не нулевая
      if (response.data) {
        // переменной локального массива присваивается массив описаний товаров,
        // полученный от серверной логики
        products.data = response.data
        // вызов функции рисования карточек и передача ей массива описаний товаров
        renderProducts(products)
      }
    }).catch(function (e) {
      // если получить данные от серверной логики не удалось -
      // выводим окно сообщения об ошибке
      alert('Products fetching error: ' + e)
    })
  }
  // стартовый вызов функции получения массива описаний товаров
  fetchProducts()
  // поиск разметки модального окна по классу стиля modal
  const modal = document.querySelectorAll('.modal')
  // активация модального окна
  const instances = M.Modal.init(modal, {})
  // строка - результат преобразования изображения в base64
  let imageBase64 = ''
  // установка обработчика выбора файла изображения на поле ввода
  // с идентификатором image
  image.onchange = function (ev) {
    // отбор первого файла из выбранных пользователем
    const file = ev.target.files[0];
    // запуск изменения размеров выбранного изображения до габаритов 300 на 300
    ImageTools.resize(file, {
        width: 300, // maximum width
        height: 300 // maximum height
      }, function(blob, didItResize) {
       // didItResize will be true if it managed to resize it, otherwise false
       // (and will return the original file as 'blob')
       // подготовка потока чтения из файла и функции обратного вызова,
       // которая будет вызвана по окончании процесса чтения
       var reader = new FileReader()
       reader.onloadend = function() {
         // сохранение преобразованного изображения в строку
        imageBase64 = reader.result
        // ... и установка его в разметку для предварительного просмотра
        preview.setAttribute('src', imageBase64)
       }
       // запуск превращения урезанного по размерам изображения в строку
       reader.readAsDataURL(blob);
      })
  }
  // поиск в разметке кнопки для асинхронной отправки формы
  const submit = document.querySelector('#newProductModal form button')
  // установка обработчика клика по кнопке отправки формы
  submit.onclick = function(eventArgs){
    // предотвращение стандартной реакции браузера на 
    eventArgs.preventDefault()
    // заполнение объекта описания нового товара
    // данными из формы
    const newProduct = {
      "title": title.value,
      "description": description.value,
      "price": 0,
      "quantity": 0,
      "image": imageBase64
    }
    // адрес конечной точки серверной логики для добавления описания нового товара
    const url = 'api/product'
    // заголовки запроса отправки данных:
    // тип запроса - POST - для размещения данных в теле запроса,
    // формат отправляемых и получаемых данных - json - для корректного чтения их серверной логикой,
    // преобразование объекта в json-строку методом stringify и размещение в теле запроса к серверу
    const requestData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    }
    // объект запроса
    const request = new Request(url, requestData)
    // отправка запроса серверной логике
    fetch(request).then(function (response) {
      // извлечение статуса ответа из отклика серверной логики
      return response.status
    }).then(function (status) {
      if (status == 201) {
        // если статус - "создано" - вызываем функцию получения
        // данных и запуска рисования карточек описаний всех товаров
        fetchProducts()
      } else {
        // иначе - сообщаем об ошибке
        alert('Product creating error')
      }
    }).catch(function (e) {
      alert('Products creating error: ' + e)
    })
  }
})