ymaps.ready(init);

function init() {
  const getFromLocalStorage = (key) =>
    localStorage[key] ? JSON.parse(localStorage[key]) : [];
  const setToLocalStorage = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  let myMap = new ymaps.Map('map', {
    center: [47.22, 39.72],
    zoom: 12,
  });
  let clusterer = new ymaps.Clusterer({
    groupByCoordinates: false,
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: false,
  });
  clusterer.events.add('click', (e) => {
    
    
    openBalloon(e.get('target').geometry.getCoordinates(), true);
  });
  myMap.geoObjects.add(clusterer);

  const localStorageKey = 'points';
  const points = getFromLocalStorage(localStorageKey);

  for (let i = 0; i < points.length; i++) {
    const placemark = new ymaps.Placemark(points[i].point);
    clusterer.add(placemark);
    placemark.events.add('click', (e) => {
      openBalloon(e.get('target').geometry.getCoordinates(), true);
    });
  }

  const balloonContent = [
    `<p>Отзыв:</p>
                <input type="text" id="name" class="input" placeholder="Укажите ваше имя">
                <br>
                <input type="text" id="place" class="input" placeholder="Укажите место">
                <br>
                <textarea  id="comment" class="textarea" rows="5" placeholder="Оставьте отзыв"></textarea>
                <button id="myButton">Отправить</button>`,
  ];

  function openBalloon(coords, withReviews) {
    const reviews = withReviews ? getReveiwsByCoords(coords) : null;
    myMap.balloon.open(coords);
    const form = createForm(coords, withReviews, reviews);
    myMap.balloon.setData(form.innerHTML);
  }
  myMap.events.add('click', function (e) {
    openBalloon(e.get('coords'));
  });

  function createForm(coords, withReviews, reviews) {
    const root = document.createElement('div');
    const list = document.createElement('div');
    root.innerHTML = balloonContent;
    const addButton = root.querySelector('#myButton');
    addButton.dataset.coords = JSON.stringify(coords);
    if (reviews) {
      reviews.forEach((review) => {
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.innerHTML = `
      <div>
        <b>${review.name}</b> [${review.place}]
      </div>
      <div>${review.comment};</div>
      `;
        list.appendChild(div);
      });
      root.prepend(list);
    }
    withReviews && (addButton.dataset.role = 'addReview');
    return root;
  }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'myButton') {
      const coords = JSON.parse(e.target.dataset.coords);
      const role = e.target.dataset.role;
      if (role !== 'addReview') {
        createPlacemark(coords)
      }

      const reveiw = {
        name: document.querySelector('#name').value,
        place: document.querySelector('#place').value,
        comment: document.querySelector('#comment').value,
        point: coords,
      };
      points.push(reveiw);
      setToLocalStorage(localStorageKey, points);
      myMap.balloon.close();
    }
  });

  function getReveiwsByCoords(point) {
    return points.filter(
      (review) => review.point[0] === point[0] && review.point[1] === point[1]
    );
  }
  function createPlacemark(coords) {
  const placemark = new ymaps.Placemark(coords);
        placemark.events.add('click', (e) => {
          openBalloon(e.get('target').geometry.getCoordinates(), true);
        });
        clusterer.add(placemark);
}
}



