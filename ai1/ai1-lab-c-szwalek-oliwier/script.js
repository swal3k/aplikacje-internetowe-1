let map = L.map('map').setView([53.2617, 14.3232], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

let marker = null;
let currentLat = null;
let currentLon = null;
let mapImageData = null;


window.addEventListener('load', function() {
    requestLocationPermission();
    requestNotificationPermission();
});

function requestLocationPermission() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log('Zgoda na lokalizację udzielona');
        }, function(error) {
            if (error.code === error.PERMISSION_DENIED) {
                alert('Brak zgody na lokalizację. Niektóre funkcje mogą być niedostępne.');
            }
        },
        {
            enableHighAccuracy: false
        }
        );
    } else {
        alert('Geolokalizacja nie jest wspierana przez tę przeglądarkę.');
    } 
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        if(Notification.permission === 'default') {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    console.log('Zgoda na powiadomienia udzielona');
                }else{
                    alert('Brak zgody na powiadomienia. Niektóre funkcje mogą być niedostępne.');
                }
            });
        }
    } else {
        alert('Powiadomienia nie są wspierane przez tę przeglądarkę.');
    }
}

document.getElementById('btn-moja-lokalizacja').addEventListener('click', function() {
    if (!navigator.geolocation) {
        alert('Geolokalizacja nie jest wspierana przez tę przeglądarkę.');
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;

        console.log('Lokalizacja uzyskana: ' + currentLat + ', ' + currentLon);

        map.setView([currentLat, currentLon], 15);

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([currentLat, currentLon]).addTo(map)
            .bindPopup('<strong>Twoja lokalizacja</strong><br>Szerokość: ' + currentLat.toFixed(6) + '<br>Długość: ' + currentLon.toFixed(6))
            .openPopup();

        drawLocationOnCanvas(currentLat, currentLon);
    }, function(error) {
        console.error(positionError); 
        alert('Nie można pobrać lokalizacji: ' + positionError.message);
    }, {
        enableHighAccuracy: false
    }
);
});

function drawLocationOnCanvas(lat, lon) {
    const canvas1 = document.getElementById('canvasMap1');
    const ctx1 = canvas1.getContext('2d');
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);

    ctx1.fillStyle = '#667eea';
    ctx1.fillRect(0, 0, canvas1.width, canvas1.height);

    ctx1.fillStyle = '#fff';
    ctx1.font = '20px Arial';
    ctx1.textAlign = 'center';
    ctx1.fillText('Twoja Lokalizacja', canvas1.width/2, 60)
    
    
    ctx1.font = '20px Arial';
    ctx1.fillText('Szerokość: ', canvas1.width/2, canvas1.height/2 - 30);
    ctx1.font='bold 18px monospace';
    ctx1.fillText(lon.toFixed(4), canvas1.width/2, canvas1.height/2 - 5);

    ctx1.font = '20px Arial';
    ctx1.fillText('Długość: ', canvas1.width/2, canvas1.height/2 + 35);
    ctx1.font='bold 18px monospace';
    ctx1.fillText(lat.toFixed(4), canvas1.width/2, canvas1.height/2 + 60);
}

document.getElementById('btn-pobierz').addEventListener('click', function() {
    if (!currentLat || !currentLon) {
        alert('Najpierw pobierz swoją lokalizację.');
        return;
    }

    console.log('Pobieranie mapy rastrowej...');
    leafletImage(map, function(err, canvas) {
        if (err) {
            console.error('Błąd podczas generowania obrazu mapy:', err);
            alert('Wystąpił błąd podczas generowania obrazu mapy.');
            return;
        }

        const canvas2 = document.getElementById('canvasMap2');
        const ctx2 = canvas2.getContext('2d');

        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        canvas2.width = canvas.width;
        canvas2.height = canvas.height;
        ctx2.drawImage(canvas, 0, 0);

        mapImageData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);

        console.log('Mapa rastrowa zapisana');

        setTimeout(() => {
            createPuzzle(canvas2);
        }, 500);
    });
});
   

let puzzlePieces = [];
let dropZones = [];

function createPuzzle(sourceCanvas) {
    console.log('Tworzenie puzzli...');

    const scatteredContainer = document.getElementById('puzzle');
    const targetContainer = document.getElementById('puzzle-target');
    scatteredContainer.innerHTML = '';
    targetContainer.innerHTML = '';
    puzzlePieces = [];
    dropZones = [];

    const rows = 4;
    const cols = 4;
    const pieceWidth = sourceCanvas.width / cols;
    const pieceHeight = sourceCanvas.height / rows;


    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const pieceId = row * cols + col;

            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;
            pieceCanvas.dataset.originalWidth = pieceWidth;
            pieceCanvas.dataset.originalHeight = pieceHeight;
            pieceCanvas.className = "puzzle-piece";
            pieceCanvas.draggable = true;
            pieceCanvas.id = `piece-${pieceId}`;
            pieceCanvas.dataset.correctId = pieceId;

            const pieceCtx = pieceCanvas.getContext('2d');
            pieceCtx.drawImage(sourceCanvas, col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

            puzzlePieces.push({
                element: pieceCanvas,
                correctId: pieceId,
                placed: false
            });

        }
    
    }


    shuffleArray(puzzlePieces);

    setTimeout(() => {
    const scatteredWidth = scatteredContainer.offsetWidth - 20;
    const scatteredHeight = scatteredContainer.offsetHeight - 20;
    const smallPieceWidth = Math.floor(scatteredWidth / cols) - 5;
    const smallPieceHeight = Math.floor(scatteredHeight / rows) - 5;

    console.log('Container size:', scatteredWidth, 'x', scatteredHeight);
    console.log('Piece size:', smallPieceWidth, 'x', smallPieceHeight);

    puzzlePieces.forEach((piece, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        const leftPos = 10 + (col * (smallPieceWidth + 5));
        const topPos = 10 + (row * (smallPieceHeight + 5));

        piece.element.style.width = `${smallPieceWidth}px`;
        piece.element.style.height = `${smallPieceHeight}px`;
        piece.element.style.left = `${leftPos}px`;
        piece.element.style.top = `${topPos}px`;
        piece.element.style.position = 'absolute';

        console.log(`Piece ${index} (row:${row}, col:${col}): left=${leftPos}, top=${topPos}`);

        scatteredContainer.appendChild(piece.element);
    });
    }, 100);

    for (let i = 0; i < rows * cols; i++) {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.zoneId = i;
        targetContainer.appendChild(dropZone);

        dropZones.push({
            element: dropZone,
            zoneId: i,
            filled: false
        });
    }

    document.getElementById('puzzle-container').style.display = 'grid';

    setupDragAndDrop();

}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function setupDragAndDrop() {
    puzzlePieces.forEach(piece => {
        piece.element.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text', this.id);
            this.style.opacity = '0.5';
            console.log('Drag start: ' + this.id);
        });

        piece.element.addEventListener('dragend', function(event) {
            this.style.opacity = '1';
        });
    });

    dropZones.forEach(zone => {
        zone.element.addEventListener('dragenter', function(event) {
            event.preventDefault();
            if(!this.classList.contains('filled')) {
                this.classList.add('drag-over');
            }
        });

        zone.element.addEventListener('dragleave', function(event) {
            this.classList.remove('drag-over');
        });

        zone.element.addEventListener('dragover', function(event) {
            event.preventDefault();
        });

        zone.element.addEventListener('drop', function(event) {
            event.preventDefault();
            this.classList.remove('drag-over');

            if(this.classList.contains('filled')) {
                return;
            }

            const pieceId = event.dataTransfer.getData('text');
            const pieceElement = document.getElementById(pieceId);
            const correctId = parseInt(pieceElement.dataset.correctId);
            const zoneId = parseInt(this.dataset.zoneId);

            if (correctId === zoneId) {
                console.log('Prawidlowe miejsce');

                this.appendChild(pieceElement);
                pieceElement.classList.add('placed');
                pieceElement.draggable = false;
                pieceElement.style.position = 'static';
                pieceElement.style.width = '100%';
                pieceElement.style.height = '100%';

                this.classList.add('filled');

                const puzzlePiece = puzzlePieces.find(p => p.element.id === pieceId);
                if (puzzlePiece) {
                    puzzlePiece.placed = true;
                }

                checkPuzzleCompletion();
            } else {
                console.log('Nieprawidlowe miejsce');
            }
        });
    });
}

function checkPuzzleCompletion() {
    const allPlaced = puzzlePieces.every(piece => piece.placed);
    if (allPlaced) {
        console.log('Puzzle ukończone!');
        showNotification('Gratulacje!', 'Ukończyłeś puzzle mapy!');
    }
}


function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        });

        setTimeout(() => notification.close(), 5000);
    }else if ('Notification' in window && Notification.permission === 'denied') {
        console.log('Brak zgody na powiadomienia.');
        alert(title + '\n' + body);
    }else{
        alert(title + '\n' + body);
    }
}

