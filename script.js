
// =======================
// Floating John label/dot/lines logic
let johnFloatingActive = true;
let johnFixedPosition = null;

function renderFloatingJohn(mousePos) {
    const svg = document.querySelector('#curves');
    if (!svg) return;
    svg.innerHTML = '';
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);

    if (!mousePos) return;
    const [x, y] = mousePos;

    // Draw horizontal line to left edge
    const hLineLeft = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLineLeft.setAttribute('x1', 0);
    hLineLeft.setAttribute('y1', y);
    hLineLeft.setAttribute('x2', x);
    hLineLeft.setAttribute('y2', y);
    hLineLeft.setAttribute('stroke', 'var(--text-color)');
    hLineLeft.setAttribute('stroke-width', '2');
    svg.appendChild(hLineLeft);

    // Draw horizontal line to right edge
    const hLineRight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLineRight.setAttribute('x1', x);
    hLineRight.setAttribute('y1', y);
    hLineRight.setAttribute('x2', window.innerWidth);
    hLineRight.setAttribute('y2', y);
    hLineRight.setAttribute('stroke', 'var(--text-color)');
    hLineRight.setAttribute('stroke-width', '2');
    svg.appendChild(hLineRight);

    // Draw vertical line to top edge
    const vLineTop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLineTop.setAttribute('x1', x);
    vLineTop.setAttribute('y1', 0);
    vLineTop.setAttribute('x2', x);
    vLineTop.setAttribute('y2', y);
    vLineTop.setAttribute('stroke', 'var(--text-color)');
    vLineTop.setAttribute('stroke-width', '2');
    svg.appendChild(vLineTop);

    // Draw vertical line to bottom edge
    const vLineBottom = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLineBottom.setAttribute('x1', x);
    vLineBottom.setAttribute('y1', y);
    vLineBottom.setAttribute('x2', x);
    vLineBottom.setAttribute('y2', window.innerHeight);
    vLineBottom.setAttribute('stroke', 'var(--text-color)');
    vLineBottom.setAttribute('stroke-width', '2');
    svg.appendChild(vLineBottom);

    // Draw dot
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', 'var(--text-color)');
    svg.appendChild(circle);

    // Draw label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 16);
    text.setAttribute('y', y + 6);
    text.setAttribute('fill', 'var(--text-color)');
    text.setAttribute('font-size', '40');
    text.setAttribute('font-family', 'monospace');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('class', 'work-label');
    text.setAttribute('style', 'user-select: none;');
    text.textContent = 'John';
    svg.appendChild(text);
}

document.addEventListener('mousemove', (e) => {
    if (johnFloatingActive && !johnFixedPosition) {
        renderFloatingJohn([e.clientX, e.clientY]);
    }
});

document.addEventListener('click', (e) => {
    if (johnFloatingActive && !johnFixedPosition) {
        johnFixedPosition = [e.clientX, e.clientY];
        johnFloatingActive = false;
        // Add the fixed John dot to the grid logic
        if (typeof state !== 'undefined') {
            state.points = [[Math.floor(johnFixedPosition[0] / state.cellSize[0]), Math.floor(johnFixedPosition[1] / state.cellSize[1])]];
            state.pointLabels = ['John'];
            dotCounter = 1;
            render();
        }
    }
});

// On page load, show floating John
window.addEventListener('DOMContentLoaded', () => {
    if (johnFloatingActive && !johnFixedPosition) {
        renderFloatingJohn([window.innerWidth / 2, window.innerHeight / 2]);
    }
});
// Exact copy of bundle.js curves module (module 2)
// =======================

// Helper: shift point by x offset
const shiftX = offset => point => [point[0] + offset, point[1]];

// Helper: match points between two unequal-length columns
const matchPointsUneven = (shorter, longer) => {
    const nodes = shorter.map(point => ({ point, connections: 0 }));
    
    const findClosest = (target, available) => {
        return available.slice().sort((a, b) => Math.abs(target[1] - a.point[1]) - Math.abs(target[1] - b.point[1]))[0];
    };
    
    const findBestMatch = point => {
        const unconnected = nodes.filter(n => n.connections === 0);
        return findClosest(point, unconnected) || findClosest(point, nodes);
    };
    
    return longer.map(point => {
        const match = findBestMatch(point);
        match.connections++;
        return [point, match.point];
    });
};

// Helper: match points between two columns
const matchPoints = pair => {
    const [col1, col2] = pair;
    
    if (col1.length === col2.length) {
        // Equal length - pair them 1:1
        return col1.map((point, i) => [point, col2[i]]);
    } else if (col1.length > col2.length) {
        return matchPointsUneven(col2, col1);
    } else {
        return matchPointsUneven(col1, col2).map(pair => pair.reverse());
    }
};

// Helper: sort points by y coordinate
const sortByY = (a, b) => {
    if (a[1] === b[1]) return 0;
    return a[1] < b[1] ? -1 : 1;
};

// Helper: create consecutive pairs from array
const makePairs = array => {
    const pairs = [];
    for (let i = 0; i <= array.length - 2; i++) {
        pairs.push([array[i], array[i + 1]]);
    }
    return pairs;
};

// Helper: Bezier-js compatible curve (minimal implementation)
class Bezier {
    constructor(x0, y0, x1, y1, x2, y2, x3, y3) {
        this.points = [
            { x: x0, y: y0 },
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            { x: x3, y: y3 }
        ];
    }
    
    compute(t) {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const t2 = t * t;
        
        const a = mt2 * mt;
        const b = mt2 * t * 3;
        const c = mt * t2 * 3;
        const d = t * t2;
        
        const p = this.points;
        return {
            x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
            y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y
        };
    }
    
    derivative(t) {
        const mt = 1 - t;
        const p = this.points;
        
        const a = 3 * mt * mt;
        const b = 6 * mt * t;
        const c = 3 * t * t;
        
        const dx0 = p[1].x - p[0].x;
        const dy0 = p[1].y - p[0].y;
        const dx1 = p[2].x - p[1].x;
        const dy1 = p[2].y - p[1].y;
        const dx2 = p[3].x - p[2].x;
        const dy2 = p[3].y - p[2].y;
        
        return {
            x: a * dx0 + b * dx1 + c * dx2,
            y: a * dy0 + b * dy1 + c * dy2
        };
    }
    
    normal(t) {
        const d = this.derivative(t);
        const len = Math.sqrt(d.x * d.x + d.y * d.y);
        return { x: -d.y / len, y: d.x / len };
    }
    
    intersects(line) {
        // Simplified line intersection for vertical line
        const results = [];
        const steps = 100;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pt = this.compute(t);
            
            if (Math.abs(pt.x - line.p1.x) < 0.01) {
                results.push(t);
            }
        }
        
        return results;
    }
}

// Helper: shift point by y offset
const shiftY = offset => point => [point[0], point[1] + offset];

// Helper: sort points by x coordinate
const sortByX = (a, b) => {
    if (a[0] === b[0]) return 0;
    return a[0] < b[0] ? -1 : 1;
};

// MAIN CURVE GENERATION FUNCTION - EXACT COPY OF BUNDLE.JS
function generateCurves(gridSize, points) {
    if (points.length === 0) return [];
    
    // HORIZONTAL CURVES (original logic)
    // Step 1: Group points by column (sparse array)
    const columns = [];
    points.forEach(point => {
        const col = point[0];
        if (!columns[col]) columns[col] = [];
        columns[col].push(point);
    });
    
    // Step 2: Sort each column by y
    const sortedColumns = Object.values(columns).map(col => col.sort(sortByY));
    
    // Step 3: Get first column for wrapping
    const firstColumn = sortedColumns[0];
    
    // Step 4: Create wrapped array: [last column shifted left] + all columns + [first column shifted right]
    const wrappedColumns = [
        sortedColumns[sortedColumns.length - 1].map(shiftX(-gridSize[0]))
    ].concat(
        sortedColumns,
        [firstColumn.map(shiftX(gridSize[0]))]
    );
    
    // Step 5: Create consecutive pairs
    const pairs = makePairs(wrappedColumns);
    
    // Step 6: Match points and flatten
    const matches = pairs
        .map(matchPoints)
        .reduce((acc, m) => acc.concat(m), []);
    
    // Step 7: Convert to Bezier curves (horizontal)
    const horizontalCurves = matches.map(pair => {
        const p1 = pair[0];
        const p2 = pair[1];
        
        const dx = 0.8 * (p2[0] - p1[0]);
        const ctrl1 = shiftX(dx)(p1);
        const ctrl2 = shiftX(-dx)(p2);
        
        return new Bezier(
            p1[0], p1[1],
            ctrl1[0], ctrl1[1],
            ctrl2[0], ctrl2[1],
            p2[0], p2[1]
        );
    });
    
    // VERTICAL CURVES (same logic but for rows)
    // Step 1: Group points by row (sparse array)
    const rows = [];
    points.forEach(point => {
        const row = point[1];
        if (!rows[row]) rows[row] = [];
        rows[row].push(point);
    });
    
    // Step 2: Sort each row by x
    const sortedRows = Object.values(rows).map(row => row.sort(sortByX));
    
    // Step 3: Get first row for wrapping
    const firstRow = sortedRows[0];
    
    // Step 4: Create wrapped array: [last row shifted up] + all rows + [first row shifted down]
    const wrappedRows = [
        sortedRows[sortedRows.length - 1].map(shiftY(-gridSize[1]))
    ].concat(
        sortedRows,
        [firstRow.map(shiftY(gridSize[1]))]
    );
    
    // Step 5: Create consecutive pairs
    const rowPairs = makePairs(wrappedRows);
    
    // Step 6: Match points and flatten
    const rowMatches = rowPairs
        .map(matchPoints)
        .reduce((acc, m) => acc.concat(m), []);
    
    // Step 7: Convert to Bezier curves (vertical)
    const verticalCurves = rowMatches.map(pair => {
        const p1 = pair[0];
        const p2 = pair[1];
        
        const dy = 0.8 * (p2[1] - p1[1]);
        const ctrl1 = shiftY(dy)(p1);
        const ctrl2 = shiftY(-dy)(p2);
        
        return new Bezier(
            p1[0], p1[1],
            ctrl1[0], ctrl1[1],
            ctrl2[0], ctrl2[1],
            p2[0], p2[1]
        );
    });
    
    // Combine both horizontal and vertical curves
    return [...horizontalCurves, ...verticalCurves];
}

// =======================
// STATE & EVENTS
// =======================
class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }
}

const emitter = new EventEmitter();

// John Cage labels
const fixedLabels = ["John", "Cage", "About"];
const works = [
    "4′33″",
        "Sounds of Venice",
    "Sonatas and Interludes",
    "Imaginary Landscape No. 5",
    "Imaginary Landscape No. 1",
    "Concert for Piano and Orchestra",
    "Aria",
    "Variations I"
];

// Work information database
const workInfo = {
    "Variations I": {
        year: "1958",
        duration: "open duration",
        medium: "Graphic score for any number of performers",
        description: "Variations I is a graphic score composed of points and straight lines. Performers interpret distances and intersections to determine musical parameters, resulting in a unique realization each time.",
        performance: "Arrange transparent sheets with points and lines freely. Distances define musical values (duration, pitch, dynamics). No fixed instrumentation. Each performer determines the sound relationship.",
    image: "img - pink/Variations I.png"
    },
    "4′33″": {
        year: "1952",
        duration: "4 minutes 33 seconds",
        medium: "Any instrument or ensemble",
        description: "A three-movement piece in which the performer intentionally makes no sound. The work foregrounds ambient noise and the act of listening itself.",
        performance: "Three tacet movements. Performer remains present but silent. Environmental sound becomes the music.",
    image: "img - pink/4′33″.png"
    },
    "Sounds of Venice": {
        year: "1959",
        duration: "variable duration",
        medium: "Environmental sound recording / sound collage",
        description: "Sounds of Venice is a composition built from field recordings Cage captured in Venice. Rather than presenting music as structured events, the work highlights the city’s natural sonic environment — water traffic, bells, voices, and incidental noise — treated as a self-contained musical experience.",
        performance: "Based on unedited or minimally edited field recordings. Focuses on listening to environmental sound as music. No score; the recording itself is the piece. Presentation can be through speakers in any spatial arrangement.",
    image: "img - pink/Sounds of Venice.png"
    },
    "Sonatas and Interludes": {
        year: "1946–48",
        duration: "approx. 70 minutes",
        medium: "Prepared piano",
        description: "A cycle exploring timbre, rhythm, and subtle emotional states influenced by Indian aesthetics. The piano’s sound is transformed through mechanical preparation.",
        performance: "Keys altered using screws, bolts, rubber, and other materials. Preparation chart must be followed exactly. Timbre determines structural relationships.",
    image: "img - pink/Sonatas and Interludes.png"
    },
    "Imaginary Landscape No. 5": {
        year: "1952",
        duration: "variable duration",
        medium: "Magnetic tape collage using 42 phonograph records",
        description: "Imaginary Landscape No. 5 is a chance-determined tape composition created from recordings of 42 jazz records. Cage used the I Ching to decide which sounds to include, how long they should last, and how they should overlap. The piece forms a dense, unpredictable collage of layered fragments.",
        performance: "Source material selected by chance from commercially available jazz records. Durations and entries determined using the I Ching. Final result assembled on magnetic tape.",
    image: "img - pink/Imaginary Landscape No. 5.png"
    },
    "Imaginary Landscape No. 1": {
        year: "1939",
        duration: "approx. 6 minutes",
        medium: "Turntables, frequency test recordings, cymbal, piano",
        description: "An early electroacoustic piece using variable-speed turntables playing test tones. Electronic textures blend with live percussion and piano.",
        performance: "Test-tone recordings manipulated through speed changes. Live elements and recorded tones interact. Conventional notation with unconventional sound sources.",
    image: "img - pink/Imaginary Landscape No. 1.png"
    },
    "Aria": {
        year: "1958",
        duration: "variable duration",
        medium: "Solo voice",
        description: "A graphic score using colored shapes and gestures instead of text. The performer freely chooses vocal style, timbre, and sequence.",
        performance: "Colors represent vocal characters or modes. No fixed pitch or rhythm. Performer determines transitions.",
    image: "img - pink/Aria.png"
    },
    "Concert for Piano and Orchestra": {
        year: "1957–58",
        duration: "variable duration",
        medium: "Piano with orchestra, independent timelines",
        description: "A large-scale graphic score of independent parts. Each performer plays unsynchronized, generating dense and evolving textures.",
        performance: "No conductor; all timelines are independent. Graphic notation interpreted individually. Performance emerges from overlapping actions.",
    image: "img - pink/Concert for Piano and Orchestra.png"
    }
};

// Map labels to available sound files
function getSoundFiles(label) {
    switch (label) {
        case 'Sounds of Venice':
            return [
                'Sounds of Venice/Performance by Agnese Toniutti, 2018.mp3',
                'Sounds of Venice/Performed by Duo Conradi–Gehlen, 2018.mp3',
                'Sounds of Venice/Performed by Katelyn King, 2020.mp3'
            ];
        case '4′33″':
            return [
                '4′33″/Performed by Berlin Philharmonic, 2020.mp3',
                '4′33″/Performed by William Marx, 2010.mp3',
                '4′33″/Performed by Kyle Shaw, 2016.mp3'
            ];
        case 'Sonatas and Interludes':
            return [
                'Sonatas and Interludes/Performed by Boris Berman, 1999.mp3',
                'Sonatas and Interludes/Performed by Carlos Sanchis Aguirre, 2014.mp3',
                'Sonatas and Interludes/Performed by Inara Ferreira, 2012.mp3'
            ];
        case 'Imaginary Landscape No. 5':
            return [
                'Imaginary Landscape No. 5/Performed by Guilherme Carvalho, 2010.mp3',
                'Imaginary Landscape No. 5/Performed by Jan Williams, 2006.mp3',
                'Imaginary Landscape No. 5/Performed by Rosario Grieco, 2014.mp3'
            ];
        case 'Imaginary Landscape No. 1':
            return [
                'Imaginary Landscape No. 1/Performed by Ensemble Musikfabrik, 2022.mp3',
                'Imaginary Landscape No. 1/Performed by Jan Williams, 2006.mp3',
                'Imaginary Landscape No. 1/Performed by Micheal Barnes, Zach Webb, Jacob Dike and Xinyi Zheng, 2018.mp3'
            ];
        case 'Concert for Piano and Orchestra':
            return [
                'Concert for Piano and Orchestra/Performed by Chironomids Outerspace Group, 2016.mp3',
                'Concert for Piano and Orchestra/Performed by Erik Griswold, Vanessa Tomlinson and NIU students, 2014.mp3',
                'Concert for Piano and Orchestra/Performed by Flemish Radio Philharmonic Orchestra, 2006.mp3'
            ];
        case 'Aria':
            return [
                'Aria/Performed by Ana Spasic, 2016.mp3',
                'Aria/Performed by Claron McFadden, 2011.mp3',
                'Aria/Performed by Sabina Meyer, 2023.mp3'
            ];
        case 'Variations I':
            return [
                'Variations I/Performed by Eberhard Blum, 2012.mp3',
                'Variations I/Performed by Matthijs Koene, 2023.mp3',
                'Variations I/Performed by Renee Butler, 1989.mp3'
            ];
        default:
            return [];
    }
}

// =======================
// AUDIO-REACTIVE CURVE WARP HELPERS
// =======================
function ensurePanelAudioContext() {
    if (!panelAudioContext) {
        panelAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (panelAudioContext.state === 'suspended') {
        panelAudioContext.resume().catch(() => {});
    }
    if (!panelAudioAnalyser) {
        panelAudioAnalyser = panelAudioContext.createAnalyser();
        panelAudioAnalyser.fftSize = 256;
        panelAudioData = new Uint8Array(panelAudioAnalyser.fftSize);
    }
}

function setupPanelAudioAnalyser(audioEl, index) {
    ensurePanelAudioContext();
    if (!panelAudioSources[index]) {
        const source = panelAudioContext.createMediaElementSource(audioEl);
        source.connect(panelAudioAnalyser);
        panelAudioAnalyser.connect(panelAudioContext.destination);
        panelAudioSources[index] = source;
    }
}

function updateCurveWarpFromAudio() {
    if (!panelAudioAnalyser || !panelAudioData) {
        curveWarp = 0;
        return;
    }
    panelAudioAnalyser.getByteTimeDomainData(panelAudioData);
    let sum = 0;
    for (let i = 0; i < panelAudioData.length; i++) {
        const v = (panelAudioData[i] - 128) / 128; // -1..1
        sum += v * v;
    }
    const rms = Math.sqrt(sum / panelAudioData.length); // 0..1
    // Scale to a wilder pixel offset (non-linear for stronger peaks)
    const boosted = Math.pow(rms, 0.7); // emphasize peaks
    curveWarp = Math.min(200, boosted * 260);
}

function startCurveAudioReactive() {
    if (curveWarpActive) return;
    curveWarpActive = true;
    const tick = () => {
        if (!curveWarpActive) return;
        updateCurveWarpFromAudio();
        if (state.isRearranged) {
            renderRearranged();
        }
        curveWarpFrame = requestAnimationFrame(tick);
    };
    tick();
}

function stopCurveAudioReactive() {
    curveWarpActive = false;
    curveWarp = 0;
    if (curveWarpFrame) {
        cancelAnimationFrame(curveWarpFrame);
        curveWarpFrame = null;
    }
    if (state.isRearranged) {
        renderRearranged();
    }
}

// Shuffle function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const allLabels = ["John", "Cage", "About", ...works];
let currentLabelOrder = [...allLabels]; // First cycle uses original order
const MAX_DOTS = 10;
let dotCounter = 0;
let isFirstCycle = true;
let panelAudioPlayers = [];
let panelAudioSources = [];
let panelAudioContext = null;
let panelAudioAnalyser = null;
let panelAudioData = null;
let curveWarpFrame = null;
let curveWarp = 0;
let curveWarpActive = false;

// Get label for a given dot index (0-9 for the dots currently on screen)
function getLabelForDotIndex(dotIndex) {
    return currentLabelOrder[dotIndex];
}

// Show and populate work information panel
function showWorkPanel(label) {
    const panel = document.getElementById('work-panel');
    if (!panel) return;
    panel.classList.remove('about-mode');
    if (label === "John" || label === "Cage") {
        const panel = document.getElementById('work-panel');
        if (!panel) return;
        const yearDuration = panel.querySelector('.work-info-year-duration');
        if (yearDuration) yearDuration.textContent = "1912–1992";
        const medium = panel.querySelector('.work-info-medium');
        if (medium) medium.textContent = "American composer and artist";
        const description = panel.querySelector('.work-info-description');
        if (description) description.textContent = "John Cage was an American composer and artist who redefined what music can be. He used chance operations, silence, and everyday sound to challenge traditional ideas of composition and control.";
        const performance = panel.querySelector('.work-info-performance');
        if (performance) performance.textContent = "Cage’s work invites listeners to pay attention to the world as it is — to accept uncertainty, notice small details, and hear meaning in unexpected places. His influence extends far beyond music, shaping contemporary art, performance, and ways of thinking about sound and perception.";
        // Hide image + audio links for John/Cage bio mode
        const mainImage = panel.querySelector('.work-info-image');
        if (mainImage) {
            mainImage.style.display = 'none';
            mainImage.style.opacity = '0';
            mainImage.removeAttribute('src');
        }
        // Hide secondary image
        const imageSecondary = document.getElementById('image-secondary');
        if (imageSecondary) {
            imageSecondary.style.opacity = '0';
            setTimeout(() => {
                imageSecondary.style.display = 'none';
                imageSecondary.removeAttribute('src');
            }, 400);
        }
        const audioLinks = panel.querySelector('.work-audio-links');
        if (audioLinks) {
            audioLinks.innerHTML = '';
        }
        panel.style.top = '50px';
        panel.style.left = '50px';
        panel.classList.add('active');
        return;
    }

    if (label === "About") {
        const yearDuration = panel.querySelector('.work-info-year-duration');
        if (yearDuration) yearDuration.textContent = "";
        const medium = panel.querySelector('.work-info-medium');
        if (medium) medium.textContent = "";
        const description = panel.querySelector('.work-info-description');
        if (description) {
            description.innerHTML = "<p>Indeterminate Navigation is an interactive website inspired by the work of John Cage, the American composer known for his non-deterministic approach to music. Cage embraced chance and performer agency, allowing each composition to unfold differently with every execution.</p><p>The website presents key works and ideas from his practice through an indeterminate navigation system. Instead of a fixed path, user actions generate a shifting visual and sonic composition, turning browsing into a performative experience. The interface functions as a score: it sets conditions, while each visit unfolds differently in real time.</p><p>Designed and developed by <a href=\"https://www.whosthemiller.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"about-credit-link\">Mia Miller</a> as part of Studio WWW: Advanced Web Design at Bezalel Academy of Arts and Design Jerusalem, under the guidance of Nir Shaked and Yotam Mano.</p>";
        }
        const performance = panel.querySelector('.work-info-performance');
        if (performance) performance.textContent = "";
        const mainImage = panel.querySelector('.work-info-image');
        if (mainImage) {
            mainImage.style.display = 'none';
            mainImage.style.opacity = '0';
            mainImage.removeAttribute('src');
        }
        const imageSecondary = document.getElementById('image-secondary');
        if (imageSecondary) {
            imageSecondary.style.opacity = '0';
            setTimeout(() => {
                imageSecondary.style.display = 'none';
                imageSecondary.removeAttribute('src');
            }, 400);
        }
        const audioLinks = panel.querySelector('.work-audio-links');
        if (audioLinks) audioLinks.innerHTML = '';
        panel.style.top = '50px';
        panel.style.left = '50px';
        panel.classList.add('about-mode');
        panel.classList.add('active');
        return;
    }

    const info = workInfo[label];

    // Populate year and duration
    const yearDuration = panel.querySelector('.work-info-year-duration');
    if (yearDuration) {
        yearDuration.textContent = `${info.year} · ${info.duration}`;
    }

    // Populate medium
    const medium = panel.querySelector('.work-info-medium');
    if (medium) {
        medium.textContent = info.medium;
    }

    // Populate description
    const description = panel.querySelector('.work-info-description');
    if (description) {
        description.textContent = info.description;
    }

    // Populate performance notes
    const performance = panel.querySelector('.work-info-performance');
    if (performance) {
        performance.textContent = info.performance;
    }

    // Show main image
    const mainImage = panel.querySelector('.work-info-image');
    if (mainImage) {
        mainImage.src = `img/${label}.jpeg`;
        mainImage.alt = `${label} score/image`;
        // Keep hidden (no image in panel for work mode)
        mainImage.style.display = 'none';
        mainImage.style.opacity = '0';
    }

    // Show secondary image in its original fixed position (previous hover image)
    let imageSecondary = document.getElementById('image-secondary');
    if (!imageSecondary) {
        imageSecondary = document.createElement('img');
        imageSecondary.id = 'image-secondary';
        imageSecondary.className = 'work-info-image-secondary';
        document.body.appendChild(imageSecondary);
    }
    imageSecondary.src = `img/${label}.jpeg`;
    imageSecondary.alt = `${label} secondary image`;
    imageSecondary.style.display = 'block';
    // Trigger fade-in
    requestAnimationFrame(() => {
        imageSecondary.style.opacity = '1';
    });

    // Build audio links under the work info
    const audioLinks = panel.querySelector('.work-audio-links');
    if (audioLinks) {
        // Stop any previously playing audio
        panelAudioPlayers.forEach(a => {
            if (a && !a.paused) {
                a.pause();
                a.currentTime = 0;
            }
        });
        panelAudioPlayers = [];
        panelAudioSources = [];
        stopCurveAudioReactive();

        audioLinks.innerHTML = '';
        const soundFiles = getSoundFiles(label);
        soundFiles.forEach((filePath, i) => {
            const displayName = filePath.split('/').pop().replace(/\.mp3$/i, '');
            const link = document.createElement('div');
            link.className = 'work-audio-link';
            link.textContent = displayName;

            link.addEventListener('mouseenter', () => {
                // Stop any other audio
                panelAudioPlayers.forEach(a => {
                    if (a && !a.paused) {
                        a.pause();
                        a.currentTime = 0;
                    }
                });
                if (!panelAudioPlayers[i]) {
                    panelAudioPlayers[i] = new Audio(encodeURI(filePath));
                    panelAudioPlayers[i].crossOrigin = 'anonymous';
                    panelAudioPlayers[i].addEventListener('error', (err) => {
                        console.error('Audio error:', filePath, err);
                    });
                }

                setupPanelAudioAnalyser(panelAudioPlayers[i], i);

                panelAudioPlayers[i].currentTime = 0;
                panelAudioPlayers[i].play().then(() => {
                    startCurveAudioReactive();
                }).catch(err => {
                    console.error('Audio play error:', filePath, err);
                });
            });

            link.addEventListener('mouseleave', () => {
                if (panelAudioPlayers[i] && !panelAudioPlayers[i].paused) {
                    panelAudioPlayers[i].pause();
                    panelAudioPlayers[i].currentTime = 0;
                }
                // Stop curve warp if no other audio playing
                const anyPlaying = panelAudioPlayers.some(a => a && !a.paused);
                if (!anyPlaying) {
                    stopCurveAudioReactive();
                }
            });

            audioLinks.appendChild(link);
        });
    }

    // Position panel to align with title (50px, 50px + title height)
    panel.style.top = '50px';
    panel.style.left = '50px';

    // Show panel
    panel.classList.add('active');
}

// Hide work information panel
function hideWorkPanel() {
    const panel = document.getElementById('work-panel');
    if (panel) {
        panel.classList.remove('active');
        // Hide main work image when exiting work mode
        const mainImage = panel.querySelector('.work-info-image');
        if (mainImage) {
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.style.display = 'none';
                mainImage.removeAttribute('src');
            }, 400);
        }
        // Clear audio links to prevent invisible hover targets
        const audioLinks = panel.querySelector('.work-audio-links');
        if (audioLinks) {
            audioLinks.innerHTML = '';
        }
        // Stop any audio playing from the panel
        panelAudioPlayers.forEach(a => {
            if (a && !a.paused) {
                a.pause();
                a.currentTime = 0;
            }
        });
        panelAudioPlayers = [];
        panelAudioSources = [];
        stopCurveAudioReactive();
    }
    // Hide secondary image when exiting work mode
    const secondaryImage = document.getElementById('image-secondary');
    if (secondaryImage) {
        secondaryImage.style.opacity = '0';
        setTimeout(() => {
            secondaryImage.style.display = 'none';
            secondaryImage.removeAttribute('src');
        }, 400);
    }
}

const state = {
    size: [64, 88],
    cellSize: [0, 0],
    points: [],
    pointLabels: [], // Store actual label text for each point
    curves: [],
    cursor: null,
    isRearranged: false,
    selectedPointIndex: null,
    originalPoints: [], // Store original grid positions
    displayPoints: [], // Store current display positions (in pixels)
    labelsFadingIn: false // Track if labels are fading in
};

// =======================
// REARRANGEMENT SYSTEM
// =======================
// 
// USAGE:
// 1. Add points by clicking on empty grid cells (up to 10 points with labels)
// 2. Click on any existing point to trigger rearrangement:
//    - The clicked point moves to top-left (50px, 50px)
//    - All other points move to the closest edge (bottom or right)
//    - All curves remain visible and stretch to connect the new positions
//    - Center area becomes available for content injection
// 
// 3. To add content to the center area, use:
//    window.injectCenterContent('<h1>Your HTML here</h1>')
//
// The center content div (#center-content) is positioned at the center
// and occupies 60% width/height, perfect for images, text, or mixed content.
// 

// Convert grid position to pixel position
function gridToPixel(gridPos) {
    return [gridPos[0] * state.cellSize[0], gridPos[1] * state.cellSize[1]];
}

// Convert pixel position to grid position
function pixelToGrid(pixelPos) {
    return [pixelPos[0] / state.cellSize[0], pixelPos[1] / state.cellSize[1]];
}

// Calculate distance from point to bottom and right edges
function getClosestEdge(pixelPos) {
    const container = document.querySelector('.main');
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const distToBottom = height - pixelPos[1];
    const distToRight = width - pixelPos[0];
    
    if (distToBottom < distToRight) {
        return { edge: 'bottom', pos: [pixelPos[0], height - 50] }; // 50px padding from edge
    } else {
        return { edge: 'right', pos: [width - 50, pixelPos[1]] }; // 50px padding from edge
    }
}

// Animate a point from one position to another
function animatePoint(fromPos, toPos, duration = 400) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);
            
            const currentPos = [
                fromPos[0] + (toPos[0] - fromPos[0]) * eased,
                fromPos[1] + (toPos[1] - fromPos[1]) * eased
            ];
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve(toPos);
            }
            
            return currentPos;
        }
        
        requestAnimationFrame(animate);
    });
}

// Rearrange all points: selected point to top-left, others to edges
async function rearrangePoints(clickedIndex) {
    if (state.isRearranged) return; // Already rearranged
    
    state.isRearranged = true;
    state.selectedPointIndex = clickedIndex;
    
    // Store original grid positions if not already stored
    if (state.originalPoints.length === 0) {
        state.originalPoints = state.points.map(p => [...p]);
    }
    
    // Initialize display points in pixels from current grid positions
    const startPositions = state.points.map(p => gridToPixel(p));
    
    const topLeftPos = [50, 50]; // Fixed position for selected point
    
    // Get container dimensions
    const container = document.querySelector('.main');
    const rect = container.getBoundingClientRect();
    
    // Separate points by edge and distribute them with spacing
    const bottomPoints = [];
    const rightPoints = [];
    
    startPositions.forEach((pixelPos, index) => {
        if (index === clickedIndex) return; // Skip selected point
        
        const edgeInfo = getClosestEdge(pixelPos);
        if (edgeInfo.edge === 'bottom') {
            bottomPoints.push({ index, x: pixelPos[0] });
        } else {
            rightPoints.push({ index, y: pixelPos[1] });
        }
    });
    
    // Sort bottom points by x position, right points by y position
    bottomPoints.sort((a, b) => a.x - b.x);
    rightPoints.sort((a, b) => a.y - b.y);
    
    // Calculate positions with minimum spacing
    const minSpacing = 100; // Minimum pixels between labels
    const bottomY = rect.height - 50;
    const rightX = rect.width - 50;
    
    // Distribute bottom points
    const bottomSpacing = Math.max(minSpacing, rect.width / (bottomPoints.length + 1));
    bottomPoints.forEach((point, i) => {
        point.targetPos = [(i + 1) * bottomSpacing, bottomY];
    });
    
    // Distribute right points
    const rightSpacing = Math.max(minSpacing, rect.height / (rightPoints.length + 1));
    rightPoints.forEach((point, i) => {
        point.targetPos = [rightX, (i + 1) * rightSpacing];
    });
    
    // Build final target positions array
    const targetPositions = startPositions.map((pixelPos, index) => {
        if (index === clickedIndex) {
            return topLeftPos;
        }
        
        const bottomPoint = bottomPoints.find(p => p.index === index);
        if (bottomPoint) return bottomPoint.targetPos;
        
        const rightPoint = rightPoints.find(p => p.index === index);
        if (rightPoint) return rightPoint.targetPos;
        
        return pixelPos; // Fallback
    });
    
    // Animate all points simultaneously
    const startTime = performance.now();
    const duration = 800; // Slower transition - 800ms
    
    // Play longer sound for rearrangement transition
    const selectedLabel = state.pointLabels[clickedIndex];
    if (typeof cageSoundEngine !== 'undefined') {
        try {
            cageSoundEngine.playRearrangementSound(selectedLabel, duration / 1000); // Convert ms to seconds
        } catch (err) {
            console.error('Sound error during rearrangement:', err);
        }
    }
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        
        // Calculate current display positions
        state.displayPoints = startPositions.map((startPos, index) => {
            const targetPos = targetPositions[index];
            return [
                startPos[0] + (targetPos[0] - startPos[0]) * eased,
                startPos[1] + (targetPos[1] - startPos[1]) * eased
            ];
        });
        
        // Render with updated positions and progressive font size
        renderRearrangedWithScale(progress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Finalize positions
            state.displayPoints = targetPositions;
            renderRearranged();
            
            // Show work information panel
            const selectedLabel = state.pointLabels[clickedIndex];
            showWorkPanel(selectedLabel);
            
            // Show center content area
            const centerContent = document.getElementById('center-content');
            if (centerContent) {
                centerContent.classList.add('active');
            }
        }
    }
    
    requestAnimationFrame(animate);
}

// Return to original positions
async function returnToOriginal() {
    if (!state.isRearranged) return;
    
    // Hide work panel BEFORE starting the animation
    hideWorkPanel();
    
    // Wait for panel to fade out (400ms transition)
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const startPositions = state.displayPoints.map(p => [...p]);
    const targetPositions = state.originalPoints.map(p => gridToPixel(p));
    
    // Enable fading during animation
    state.labelsFadingIn = true;
    
    // Animate back
    const startTime = performance.now();
    const duration = 800; // Slower transition - 800ms
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        
        // Calculate current positions
        state.displayPoints = startPositions.map((startPos, index) => {
            const targetPos = targetPositions[index];
            return [
                startPos[0] + (targetPos[0] - startPos[0]) * eased,
                startPos[1] + (targetPos[1] - startPos[1]) * eased
            ];
        });
        
        // Render with fading labels (pass progress for opacity)
        renderRearrangedWithFade(progress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Reset to normal mode
            state.isRearranged = false;
            state.selectedPointIndex = null;
            state.displayPoints = [];
            state.originalPoints = []; // Clear original points so next rearrange works
            state.labelsFadingIn = false;
            
            // Hide center content
            const centerContent = document.getElementById('center-content');
            if (centerContent) {
                centerContent.classList.remove('active');
            }
            
            // Return to normal rendering
            render();
        }
    }
    
    requestAnimationFrame(animate);
}

// Update curves to connect points at their new display positions
function updateCurvesForRearrangement() {
    // We need to recreate the curves with the same connections but new positions
    // Each curve connects two points, we need to find which points and update coordinates
}

// Render in rearranged mode with fading labels
function renderRearrangedWithFade(fadeProgress) {
    const svg = document.querySelector('#curves');
    if (!svg) return;
    
    svg.innerHTML = '';
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    
    // Render curves - we need to draw them based on original connections but new positions
    let renderedCount = 0;
    let skippedCount = 0;
    state.curves.forEach((curve) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Get original grid positions for this curve's endpoints
        const startGridX = Math.round(curve.points[0].x);
        const startGridY = Math.round(curve.points[0].y);
        const endGridX = Math.round(curve.points[3].x);
        const endGridY = Math.round(curve.points[3].y);
        
        // Find which point indices these correspond to
        let startIndex = -1;
        let endIndex = -1;
        
        state.originalPoints.forEach((p, i) => {
            if (Math.abs(p[0] - startGridX) < 1.0 && Math.abs(p[1] - startGridY) < 1.0) {
                startIndex = i;
            }
            if (Math.abs(p[0] - endGridX) < 1.0 && Math.abs(p[1] - endGridY) < 1.0) {
                endIndex = i;
            }
        });
        
        // For curves where we can't find endpoints in our 10 points, 
        // they must connect points outside our selection - render them at original positions with reveal animation
        if (startIndex === -1 || endIndex === -1) {
            // Render at original grid positions
            const p0 = curve.points[0];
            const p1 = curve.points[1];
            const p2 = curve.points[2];
            const p3 = curve.points[3];
            
            const x0 = p0.x * state.cellSize[0];
            const y0 = p0.y * state.cellSize[1];
            const x1 = p1.x * state.cellSize[0];
            const y1 = p1.y * state.cellSize[1];
            const x2 = p2.x * state.cellSize[0];
            const y2 = p2.y * state.cellSize[1];
            const x3 = p3.x * state.cellSize[0];
            const y3 = p3.y * state.cellSize[1];
            
            // Determine which endpoint is closer to screen edge
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            const distToEdge0 = Math.min(x0, y0, screenWidth - x0, screenHeight - y0);
            const distToEdge3 = Math.min(x3, y3, screenWidth - x3, screenHeight - y3);
            
            // If p0 is closer to edge, draw from p0 to p3 (normal)
            // If p3 is closer to edge, draw from p3 to p0 (reversed)
            const shouldReverse = distToEdge3 < distToEdge0;
            
            let d;
            if (shouldReverse) {
                // Reverse the curve direction
                d = `M ${x3} ${y3} C ${x2} ${y2}, ${x1} ${y1}, ${x0} ${y0}`;
            } else {
                // Normal direction
                d = `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
            }
            
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'var(--text-color)'); // Back to original green color
            path.setAttribute('stroke-width', '1');
            
            // Animate reveal from edge toward point
            const pathLength = Math.sqrt(
                Math.pow(x3 - x0, 2) + Math.pow(y3 - y0, 2)
            ) * 1.5; // Approximate curve length
            
            // Animate from fully hidden to fully visible (drawing from edge toward center)
            path.setAttribute('stroke-dasharray', pathLength);
            path.setAttribute('stroke-dashoffset', pathLength * (1 - fadeProgress)); // Reveal as fadeProgress goes 0→1
            path.setAttribute('opacity', '1');
            
            svg.appendChild(path);
            return;
        }
        
        // Skip if displayPoints missing
        if (!state.displayPoints[startIndex] || !state.displayPoints[endIndex]) {
            return;
        }
        
        // If we found both endpoints, draw the curve at their new positions
        if (startIndex !== -1 && endIndex !== -1 && state.displayPoints[startIndex] && state.displayPoints[endIndex]) {
            const startPixel = state.displayPoints[startIndex];
            const endPixel = state.displayPoints[endIndex];
            
            // Get original control points from the curve
            const origCP1 = curve.points[1];
            const origCP2 = curve.points[2];
            
            // Convert original control points to pixel positions
            const origCP1Pixel = [origCP1.x * state.cellSize[0], origCP1.y * state.cellSize[1]];
            const origCP2Pixel = [origCP2.x * state.cellSize[0], origCP2.y * state.cellSize[1]];
            
            // Get original endpoints in pixels
            const origStartPixel = gridToPixel(state.originalPoints[startIndex]);
            const origEndPixel = gridToPixel(state.originalPoints[endIndex]);
            
            // Calculate offset vectors from original start to control points
            const offset1x = origCP1Pixel[0] - origStartPixel[0];
            const offset1y = origCP1Pixel[1] - origStartPixel[1];
            const offset2x = origCP2Pixel[0] - origStartPixel[0];
            const offset2y = origCP2Pixel[1] - origStartPixel[1];
            
            // Scale factors based on distance change
            const origDist = Math.sqrt(
                Math.pow(origEndPixel[0] - origStartPixel[0], 2) + 
                Math.pow(origEndPixel[1] - origStartPixel[1], 2)
            );
            const newDist = Math.sqrt(
                Math.pow(endPixel[0] - startPixel[0], 2) + 
                Math.pow(endPixel[1] - startPixel[1], 2)
            );
            const scale = origDist > 0 ? newDist / origDist : 1;
            
            // Calculate rotation angle
            const origAngle = Math.atan2(origEndPixel[1] - origStartPixel[1], origEndPixel[0] - origStartPixel[0]);
            const newAngle = Math.atan2(endPixel[1] - startPixel[1], endPixel[0] - startPixel[0]);
            const rotationAngle = newAngle - origAngle;
            
            // Apply rotation and scaling to control point offsets
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);
            
            const cp1x = startPixel[0] + scale * (offset1x * cos - offset1y * sin);
            const cp1y = startPixel[1] + scale * (offset1x * sin + offset1y * cos);
            const cp2x = startPixel[0] + scale * (offset2x * cos - offset2y * sin);
            const cp2y = startPixel[1] + scale * (offset2x * sin + offset2y * cos);
            
            const d = `M ${startPixel[0]} ${startPixel[1]} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPixel[0]} ${endPixel[1]}`;
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'var(--text-color)'); // Back to original green color
            path.setAttribute('stroke-width', '1');
            path.setAttribute('opacity', '1'); // All visible - no fade
            
            svg.appendChild(path);
        }
    });
    
    // Render points at display positions
    state.displayPoints.forEach((pixelPos, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pixelPos[0]);
        circle.setAttribute('cy', pixelPos[1]);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', 'var(--text-color)');
        svg.appendChild(circle);
        // ...existing code for label rendering, no sound logic on click...
        const label = state.pointLabels[index];
        const isJohnOrCage = label === 'John' || label === 'Cage';
        let displayLabel = label;
        if (index === state.selectedPointIndex && isJohnOrCage) {
            displayLabel = fadeProgress < 0.5 ? 'John Cage' : label;
        }
        const startSize = isJohnOrCage ? 48 : 36;
        const endSize = isJohnOrCage ? 40 : 20;
        const currentSize = startSize + (endSize - startSize) * fadeProgress;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pixelPos[0] + 15);
        text.setAttribute('y', pixelPos[1] + 5);
        text.setAttribute('fill', 'var(--text-color)');
        text.setAttribute('font-size', currentSize);
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('font-weight', isJohnOrCage ? 'bold' : 'normal');
        text.setAttribute('class', 'work-label');
        text.setAttribute('style', 'pointer-events: none; user-select: none;');
        if (index === state.selectedPointIndex) {
            text.setAttribute('opacity', '1');
        } else {
            text.setAttribute('opacity', fadeProgress);
        }
        text.textContent = displayLabel;
        svg.appendChild(text);
    });
}

// Render in rearranged mode with progressive font scaling
function renderRearrangedWithScale(scaleProgress) {
    const svg = document.querySelector('#curves');
    if (!svg) return;
    
    svg.innerHTML = '';
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    
    // Render curves
    state.curves.forEach((curve) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        const startGridX = Math.round(curve.points[0].x);
        const startGridY = Math.round(curve.points[0].y);
        const endGridX = Math.round(curve.points[3].x);
        const endGridY = Math.round(curve.points[3].y);
        
        let startIndex = -1;
        let endIndex = -1;
        
        state.originalPoints.forEach((p, i) => {
            if (Math.abs(p[0] - startGridX) < 1.0 && Math.abs(p[1] - startGridY) < 1.0) {
                startIndex = i;
            }
            if (Math.abs(p[0] - endGridX) < 1.0 && Math.abs(p[1] - endGridY) < 1.0) {
                endIndex = i;
            }
        });
        
        // For curves outside our 10 points, render at original positions with hide animation
        if (startIndex === -1 || endIndex === -1) {
            const p0 = curve.points[0];
            const p1 = curve.points[1];
            const p2 = curve.points[2];
            const p3 = curve.points[3];
            
            const x0 = p0.x * state.cellSize[0];
            const y0 = p0.y * state.cellSize[1];
            const x1 = p1.x * state.cellSize[0];
            const y1 = p1.y * state.cellSize[1];
            const x2 = p2.x * state.cellSize[0];
            const y2 = p2.y * state.cellSize[1];
            const x3 = p3.x * state.cellSize[0];
            const y3 = p3.y * state.cellSize[1];
            
            // Determine which endpoint is closer to screen edge
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            const distToEdge0 = Math.min(x0, y0, screenWidth - x0, screenHeight - y0);
            const distToEdge3 = Math.min(x3, y3, screenWidth - x3, screenHeight - y3);
            
            // If p0 is closer to edge, draw from p0 to p3 (normal)
            // If p3 is closer to edge, draw from p3 to p0 (reversed)
            const shouldReverse = distToEdge3 < distToEdge0;
            
            let d;
            if (shouldReverse) {
                // Reverse the curve direction
                d = `M ${x3} ${y3} C ${x2} ${y2}, ${x1} ${y1}, ${x0} ${y0}`;
            } else {
                // Normal direction
                d = `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
            }
            
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'var(--text-color)'); // Back to original green color
            path.setAttribute('stroke-width', '1');
            
            // Animate hiding toward edge of screen (reverse of reveal)
            const pathLength = Math.sqrt(
                Math.pow(x3 - x0, 2) + Math.pow(y3 - y0, 2)
            ) * 1.5; // Approximate curve length
            
            // Animate from fully visible to fully hidden
            path.setAttribute('stroke-dasharray', pathLength);
            path.setAttribute('stroke-dashoffset', pathLength * scaleProgress); // Hide as scaleProgress goes 0→1
            path.setAttribute('opacity', '1');
            
            svg.appendChild(path);
            return;
        }
        
        // Skip if displayPoints missing
        if (!state.displayPoints[startIndex] || !state.displayPoints[endIndex]) {
            return;
        }
        
        if (startIndex !== -1 && endIndex !== -1 && state.displayPoints[startIndex] && state.displayPoints[endIndex]) {
            const startPixel = state.displayPoints[startIndex];
            const endPixel = state.displayPoints[endIndex];
            
            const origCP1 = curve.points[1];
            const origCP2 = curve.points[2];
            const origCP1Pixel = [origCP1.x * state.cellSize[0], origCP1.y * state.cellSize[1]];
            const origCP2Pixel = [origCP2.x * state.cellSize[0], origCP2.y * state.cellSize[1]];
            const origStartPixel = gridToPixel(state.originalPoints[startIndex]);
            const origEndPixel = gridToPixel(state.originalPoints[endIndex]);
            
            const offset1x = origCP1Pixel[0] - origStartPixel[0];
            const offset1y = origCP1Pixel[1] - origStartPixel[1];
            const offset2x = origCP2Pixel[0] - origStartPixel[0];
            const offset2y = origCP2Pixel[1] - origStartPixel[1];
            
            const origDist = Math.sqrt(Math.pow(origEndPixel[0] - origStartPixel[0], 2) + Math.pow(origEndPixel[1] - origStartPixel[1], 2));
            const newDist = Math.sqrt(Math.pow(endPixel[0] - startPixel[0], 2) + Math.pow(endPixel[1] - startPixel[1], 2));
            const scale = origDist > 0 ? newDist / origDist : 1;
            
            const origAngle = Math.atan2(origEndPixel[1] - origStartPixel[1], origEndPixel[0] - origStartPixel[0]);
            const newAngle = Math.atan2(endPixel[1] - startPixel[1], endPixel[0] - startPixel[0]);
            const rotationAngle = newAngle - origAngle;
            
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);
            
            const cp1x = startPixel[0] + scale * (offset1x * cos - offset1y * sin);
            const cp1y = startPixel[1] + scale * (offset1x * sin + offset1y * cos);
            const cp2x = startPixel[0] + scale * (offset2x * cos - offset2y * sin);
            const cp2y = startPixel[1] + scale * (offset2x * sin + offset2y * cos);
            
            const d = `M ${startPixel[0]} ${startPixel[1]} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPixel[0]} ${endPixel[1]}`;
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'var(--text-color)'); // Back to original green color
            path.setAttribute('stroke-width', '1');
            path.setAttribute('opacity', '1'); // All visible - no fade
            
            svg.appendChild(path);
        }
    });
    
    // Render points with progressive font size
    state.displayPoints.forEach((pixelPos, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pixelPos[0]);
        circle.setAttribute('cy', pixelPos[1]);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', 'var(--text-color)');
        svg.appendChild(circle);
        
        if (index === state.selectedPointIndex) {
            const label = state.pointLabels[index];
            const isJohnOrCage = label === 'John' || label === 'Cage';
            
            // Display "John Cage" for John/Cage
            const displayLabel = isJohnOrCage ? 'John Cage' : label;
            
            // Calculate progressive font size
            // Start: John/Cage=40, works=20
            // End: John/Cage=48, works=36
            const startSize = isJohnOrCage ? 40 : 20;
            const endSize = isJohnOrCage ? 48 : 36;
            const currentSize = startSize + (endSize - startSize) * scaleProgress;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pixelPos[0] + 15);
            text.setAttribute('y', pixelPos[1] + 5);
            text.setAttribute('fill', 'var(--text-color)');
            text.setAttribute('font-size', currentSize);
            text.setAttribute('font-family', 'monospace');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('class', 'work-label');
            text.setAttribute('style', 'cursor: pointer; user-select: none;');
            text.textContent = displayLabel;
            
            svg.appendChild(text);
        }
    });
}

// Apply audio-reactive warp to a control point while keeping endpoints fixed
function warpControlPoint(cp, startPixel, endPixel, curveIndex) {
    if (!curveWarpActive || curveWarp === 0) return cp;
    const dx = endPixel[0] - startPixel[0];
    const dy = endPixel[1] - startPixel[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return cp;
    const nx = -dy / len; // normal vector
    const ny = dx / len;
    const t = performance.now() / 220 + curveIndex * 0.7;
    const mag = curveWarp * Math.sin(t);
    return [cp[0] + nx * mag, cp[1] + ny * mag];
}

// Render in rearranged mode
function renderRearranged() {
    const svg = document.querySelector('#curves');
    if (!svg) return;
    
    svg.innerHTML = '';
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    
    // Render curves - we need to draw them based on original connections but new positions
    state.curves.forEach((curve, curveIndex) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Get original grid positions for this curve's endpoints
        const startGridX = Math.round(curve.points[0].x);
        const startGridY = Math.round(curve.points[0].y);
        const endGridX = Math.round(curve.points[3].x);
        const endGridY = Math.round(curve.points[3].y);
        
        // Find which point indices these correspond to
        let startIndex = -1;
        let endIndex = -1;
        
        state.originalPoints.forEach((p, i) => {
            if (Math.abs(p[0] - startGridX) < 1.0 && Math.abs(p[1] - startGridY) < 1.0) {
                startIndex = i;
            }
            if (Math.abs(p[0] - endGridX) < 1.0 && Math.abs(p[1] - endGridY) < 1.0) {
                endIndex = i;
            }
        });
        
        // If we found both endpoints, draw the curve at their new positions
    if (startIndex !== -1 && endIndex !== -1 && state.displayPoints[startIndex] && state.displayPoints[endIndex]) {
            const startPixel = state.displayPoints[startIndex];
            const endPixel = state.displayPoints[endIndex];
            
            // Get original control points from the curve
            const origCP1 = curve.points[1];
            const origCP2 = curve.points[2];
            
            // Convert original control points to pixel positions
            const origCP1Pixel = [origCP1.x * state.cellSize[0], origCP1.y * state.cellSize[1]];
            const origCP2Pixel = [origCP2.x * state.cellSize[0], origCP2.y * state.cellSize[1]];
            
            // Get original endpoints in pixels
            const origStartPixel = gridToPixel(state.originalPoints[startIndex]);
            const origEndPixel = gridToPixel(state.originalPoints[endIndex]);
            
            // Calculate offset vectors from original start to control points
            const offset1x = origCP1Pixel[0] - origStartPixel[0];
            const offset1y = origCP1Pixel[1] - origStartPixel[1];
            const offset2x = origCP2Pixel[0] - origStartPixel[0];
            const offset2y = origCP2Pixel[1] - origStartPixel[1];
            
            // Scale factors based on distance change
            const origDist = Math.sqrt(
                Math.pow(origEndPixel[0] - origStartPixel[0], 2) + 
                Math.pow(origEndPixel[1] - origStartPixel[1], 2)
            );
            const newDist = Math.sqrt(
                Math.pow(endPixel[0] - startPixel[0], 2) + 
                Math.pow(endPixel[1] - startPixel[1], 2)
            );
            const scale = origDist > 0 ? newDist / origDist : 1;
            
            // Calculate rotation angle
            const origAngle = Math.atan2(origEndPixel[1] - origStartPixel[1], origEndPixel[0] - origStartPixel[0]);
            const newAngle = Math.atan2(endPixel[1] - startPixel[1], endPixel[0] - startPixel[0]);
            const rotationAngle = newAngle - origAngle;
            
            // Apply rotation and scaling to control point offsets
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);
            
            let cp1x = startPixel[0] + scale * (offset1x * cos - offset1y * sin);
            let cp1y = startPixel[1] + scale * (offset1x * sin + offset1y * cos);
            let cp2x = startPixel[0] + scale * (offset2x * cos - offset2y * sin);
            let cp2y = startPixel[1] + scale * (offset2x * sin + offset2y * cos);

            // Apply audio-reactive warp to control points (endpoints stay fixed)
            const warped1 = warpControlPoint([cp1x, cp1y], startPixel, endPixel, curveIndex);
            const warped2 = warpControlPoint([cp2x, cp2y], startPixel, endPixel, curveIndex + 1.5);
            cp1x = warped1[0]; cp1y = warped1[1];
            cp2x = warped2[0]; cp2y = warped2[1];
            
            const d = `M ${startPixel[0]} ${startPixel[1]} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPixel[0]} ${endPixel[1]}`;
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'var(--text-color)'); // Back to original green color
            path.setAttribute('stroke-width', '1');
            path.setAttribute('opacity', '1');
            
            svg.appendChild(path);

            // ...existing code for curve rendering...
        }
    });

    // Only show pink dots if selected label is not 'John', 'Cage', or 'About'
    const selectedLabel = state.pointLabels[state.selectedPointIndex];
    if (selectedLabel !== 'John' && selectedLabel !== 'Cage' && selectedLabel !== 'About') {
        // Add exactly 5 pink dots distributed across all curves connected to the selected label dot
        const connectedCurves = [];
        state.curves.forEach((curve) => {
            const startGridX = Math.round(curve.points[0].x);
            const startGridY = Math.round(curve.points[0].y);
            const endGridX = Math.round(curve.points[3].x);
            const endGridY = Math.round(curve.points[3].y);
            let startIndex = -1;
            let endIndex = -1;
            state.originalPoints.forEach((p, i) => {
                if (Math.abs(p[0] - startGridX) < 1.0 && Math.abs(p[1] - startGridY) < 1.0) {
                    startIndex = i;
                }
                if (Math.abs(p[0] - endGridX) < 1.0 && Math.abs(p[1] - endGridY) < 1.0) {
                    endIndex = i;
                }
            });
            if (
                (startIndex === state.selectedPointIndex && endIndex !== -1) ||
                (endIndex === state.selectedPointIndex && startIndex !== -1)
            ) {
                connectedCurves.push({ curve, startIndex, endIndex });
            }
        });

        // Place 3 pink dots, always, even if some positions are excluded
        const totalDots = 3;
        const minT = 0.18;
        const maxT = 0.82;
        let validDotPositions = [];
        if (connectedCurves.length > 0) {
            for (let i = 0; i < totalDots * 5; i++) { // Try more positions than needed
                const curveObj = connectedCurves[i % connectedCurves.length];
                const { curve, startIndex, endIndex } = curveObj;
                const t = minT + (maxT - minT) * ((i % totalDots) / (totalDots - 1));
                const startPixel = state.displayPoints[startIndex];
                const endPixel = state.displayPoints[endIndex];
                const origCP1 = curve.points[1];
                const origCP2 = curve.points[2];
                const origCP1Pixel = [origCP1.x * state.cellSize[0], origCP1.y * state.cellSize[1]];
                const origCP2Pixel = [origCP2.x * state.cellSize[0], origCP2.y * state.cellSize[1]];
                const origStartPixel = gridToPixel(state.originalPoints[startIndex]);
                const origEndPixel = gridToPixel(state.originalPoints[endIndex]);
                const offset1x = origCP1Pixel[0] - origStartPixel[0];
                const offset1y = origCP1Pixel[1] - origStartPixel[1];
                const offset2x = origCP2Pixel[0] - origStartPixel[0];
                const offset2y = origCP2Pixel[1] - origStartPixel[1];
                const origDist = Math.sqrt(
                    Math.pow(origEndPixel[0] - origStartPixel[0], 2) +
                    Math.pow(origEndPixel[1] - origStartPixel[1], 2)
                );
                const newDist = Math.sqrt(
                    Math.pow(endPixel[0] - startPixel[0], 2) +
                    Math.pow(endPixel[1] - startPixel[1], 2)
                );
                const scale = origDist > 0 ? newDist / origDist : 1;
                const origAngle = Math.atan2(origEndPixel[1] - origStartPixel[1], origEndPixel[0] - origStartPixel[0]);
                const newAngle = Math.atan2(endPixel[1] - startPixel[1], endPixel[0] - startPixel[0]);
                const rotationAngle = newAngle - origAngle;
                const cos = Math.cos(rotationAngle);
                const sin = Math.sin(rotationAngle);
                const cp1x = startPixel[0] + scale * (offset1x * cos - offset1y * sin);
                const cp1y = startPixel[1] + scale * (offset1x * sin + offset1y * cos);
                const cp2x = startPixel[0] + scale * (offset2x * cos - offset2y * sin);
                const cp2y = startPixel[1] + scale * (offset2x * sin + offset2y * cos);
                // Cubic Bezier interpolation
                const x = Math.pow(1-t,3)*startPixel[0] + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*t*t*cp2x + Math.pow(t,3)*endPixel[0];
                const y = Math.pow(1-t,3)*startPixel[1] + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*t*t*cp2y + Math.pow(t,3)*endPixel[1];
                // Avoid placing dots too close to the label or in the left third of the screen
                const labelPos = state.displayPoints[state.selectedPointIndex];
                const distToLabel = Math.sqrt(Math.pow(x - labelPos[0], 2) + Math.pow(y - labelPos[1], 2));
                const screenWidth = window.innerWidth;
                if (distToLabel < 40 || x < screenWidth / 3) {
                    continue;
                }
                validDotPositions.push({x, y});
                if (validDotPositions.length >= totalDots) break;
            }
        }
        // If not enough valid positions, fill with best available positions (ignoring exclusion)
        while (validDotPositions.length < totalDots && connectedCurves.length > 0) {
            const curveObj = connectedCurves[validDotPositions.length % connectedCurves.length];
            const { curve, startIndex, endIndex } = curveObj;
            const t = minT + (maxT - minT) * (validDotPositions.length / (totalDots - 1));
            const startPixel = state.displayPoints[startIndex];
            const endPixel = state.displayPoints[endIndex];
            const origCP1 = curve.points[1];
            const origCP2 = curve.points[2];
            const origCP1Pixel = [origCP1.x * state.cellSize[0], origCP1.y * state.cellSize[1]];
            const origCP2Pixel = [origCP2.x * state.cellSize[0], origCP2.y * state.cellSize[1]];
            const origStartPixel = gridToPixel(state.originalPoints[startIndex]);
            const origEndPixel = gridToPixel(state.originalPoints[endIndex]);
            const offset1x = origCP1Pixel[0] - origStartPixel[0];
            const offset1y = origCP1Pixel[1] - origStartPixel[1];
            const offset2x = origCP2Pixel[0] - origStartPixel[0];
            const offset2y = origCP2Pixel[1] - origStartPixel[1];
            const origDist = Math.sqrt(
                Math.pow(origEndPixel[0] - origStartPixel[0], 2) +
                Math.pow(origEndPixel[1] - origStartPixel[1], 2)
            );
            const newDist = Math.sqrt(
                Math.pow(endPixel[0] - startPixel[0], 2) +
                Math.pow(endPixel[1] - startPixel[1], 2)
            );
            const scale = origDist > 0 ? newDist / origDist : 1;
            const origAngle = Math.atan2(origEndPixel[1] - origStartPixel[1], origEndPixel[0] - origStartPixel[0]);
            const newAngle = Math.atan2(endPixel[1] - startPixel[1], endPixel[0] - startPixel[0]);
            const rotationAngle = newAngle - origAngle;
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);
            const cp1x = startPixel[0] + scale * (offset1x * cos - offset1y * sin);
            const cp1y = startPixel[1] + scale * (offset1x * sin + offset1y * cos);
            const cp2x = startPixel[0] + scale * (offset2x * cos - offset2y * sin);
            const cp2y = startPixel[1] + scale * (offset2x * sin + offset2y * cos);
            const x = Math.pow(1-t,3)*startPixel[0] + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*t*t*cp2x + Math.pow(t,3)*endPixel[0];
            const y = Math.pow(1-t,3)*startPixel[1] + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*t*t*cp2y + Math.pow(t,3)*endPixel[1];
            validDotPositions.push({x, y});
        }
    }
    // ...existing code for rendering points and labels...
    
    // Render points and labels for all points
    // Find the topmost (lowest y) John/Cage point
    let topJohnCageIndex = -1;
    let minY = Infinity;
    state.displayPoints.forEach((pixelPos, index) => {
        const label = state.pointLabels[index];
        if ((label === 'John' || label === 'Cage') && pixelPos[1] < minY) {
            minY = pixelPos[1];
            topJohnCageIndex = index;
        }
    });

    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const bottomThreshold = screenHeight * 0.8; // Hide labels below this y
    const rightThreshold = screenWidth * 0.8; // Hide labels right of this x
    state.displayPoints.forEach((pixelPos, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pixelPos[0]);
        circle.setAttribute('cy', pixelPos[1]);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', 'var(--text-color)');
        // Fade out dots near bottom/right edge in work view
        let fade = false;
        if (state.isRearranged) {
            const screenHeight = window.innerHeight;
            const screenWidth = window.innerWidth;
            const bottomThreshold = screenHeight * 0.8;
            const rightThreshold = screenWidth * 0.8;
            // Only keep label dot visible
            if (!(index === state.selectedPointIndex) && (pixelPos[1] > bottomThreshold || pixelPos[0] > rightThreshold)) {
                fade = true;
            }
        }
        circle.setAttribute('opacity', fade ? '0' : '1');
        circle.setAttribute('style', `transition: opacity 0.6s cubic-bezier(.4,0,.2,1);`);
        svg.appendChild(circle);

        const label = state.pointLabels[index];
        const isJohnOrCage = label === 'John' || label === 'Cage';
        // Only show label if not in the bottom 20% or rightmost 20% of the screen
        if (pixelPos[1] < bottomThreshold && pixelPos[0] < rightThreshold && (!isJohnOrCage || index === topJohnCageIndex)) {
            const displayLabel = isJohnOrCage ? 'John Cage' : label;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pixelPos[0] + 15);
            text.setAttribute('y', pixelPos[1] + 5);
            text.setAttribute('fill', 'var(--text-color)');
            text.setAttribute('font-size', isJohnOrCage ? '48' : '36');
            text.setAttribute('font-family', 'monospace');
            text.setAttribute('font-weight', isJohnOrCage ? 'bold' : 'normal');
            text.setAttribute('class', 'work-label');
            text.setAttribute('style', 'cursor: default; user-select: none; pointer-events: none;');
            text.textContent = displayLabel;
            svg.appendChild(text);
        }
    });
}

// =======================
// RENDERING
// =======================
function render() {
    const svg = document.querySelector('#curves');
    if (!svg) return;
    
    svg.innerHTML = '';
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    
    // Render curves
    state.curves.forEach((curve, i) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Convert grid coords to pixels
        const p0 = curve.points[0];
        const p1 = curve.points[1];
        const p2 = curve.points[2];
        const p3 = curve.points[3];
        
        const x0 = p0.x * state.cellSize[0];
        const y0 = p0.y * state.cellSize[1];
        const x1 = p1.x * state.cellSize[0];
        const y1 = p1.y * state.cellSize[1];
        const x2 = p2.x * state.cellSize[0];
        const y2 = p2.y * state.cellSize[1];
        const x3 = p3.x * state.cellSize[0];
        const y3 = p3.y * state.cellSize[1];
        
        const d = `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'var(--text-color)');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('opacity', '1');
        
        svg.appendChild(path);
    });
    
    // Render points with labels
    state.points.forEach((point, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point[0] * state.cellSize[0]);
        circle.setAttribute('cy', point[1] * state.cellSize[1]);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', 'var(--text-color)');
        svg.appendChild(circle);
        
        // Add text label next to the dot using stored label
        const label = state.pointLabels[index];
        const isJohnOrCage = label === 'John' || label === 'Cage';
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', point[0] * state.cellSize[0] + 15);
        text.setAttribute('y', point[1] * state.cellSize[1] + 5);
        text.setAttribute('fill', 'var(--text-color)');
    text.setAttribute('font-size', isJohnOrCage ? '40' : '20');
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('font-weight', isJohnOrCage ? 'bold' : 'normal');
        text.setAttribute('class', 'work-label');
        text.setAttribute('data-index', index);
        
        // If labels are fading in, start with opacity 0
        if (state.labelsFadingIn) {
            text.setAttribute('opacity', '0');
            text.setAttribute('style', 'pointer-events: none; user-select: none; transition: opacity 0.4s ease;');
            // Trigger fade in after a tiny delay
            setTimeout(() => {
                text.setAttribute('opacity', '1');
            }, 10);
        } else {
            text.setAttribute('style', 'pointer-events: none; user-select: none;');
        }
        
        text.textContent = label;
        svg.appendChild(text);
        
        // Get text bounding box for clickable area
        const bbox = text.getBBox();
        
        // Create invisible rectangle for better click target (appended before text to prevent flickering)
        const clickArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clickArea.setAttribute('x', bbox.x - 20);
        clickArea.setAttribute('y', bbox.y - 20);
        clickArea.setAttribute('width', bbox.width + 40);
        clickArea.setAttribute('height', bbox.height + 40);
        clickArea.setAttribute('fill', 'transparent');
        clickArea.setAttribute('cursor', 'pointer');
        clickArea.setAttribute('style', 'pointer-events: all;');
        
        // Store reference to text for hover effect
        const textElement = text;
        let isHovered = false;
        
        // Add hover effect to clickArea with debouncing
        clickArea.addEventListener('mouseenter', (e) => {
            if (!isHovered) {
                isHovered = true;
                textElement.setAttribute('fill', 'var(--accent-color)');
            }
        }, { passive: true });
        
        clickArea.addEventListener('mouseleave', (e) => {
            if (isHovered) {
                isHovered = false;
                textElement.setAttribute('fill', 'var(--text-color)');
            }
        }, { passive: true });
        
        // Add click handler to clickArea
        clickArea.addEventListener('click', (e) => {
            e.stopPropagation();
            rearrangePoints(index);
        });
        
        // Insert clickArea before text in DOM (SVG stacking order)
        svg.insertBefore(clickArea, text);
    });
    
    // Render cursor
    if (state.cursor) {
        const cursorEl = document.querySelector('.cursor');
        if (cursorEl) {
            cursorEl.style.left = (state.cursor[0] * state.cellSize[0]) + 'px';
            cursorEl.style.top = (state.cursor[1] * state.cellSize[1]) + 'px';
        }
    }
}

// =======================
// MOUSE INTERACTION
// =======================
function setupMouse() {
    const container = document.querySelector('.main');
    if (!container) return;
    
    const getGridPosition = (e) => {
        const rect = container.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / state.cellSize[0]);
        const y = Math.floor((e.clientY - rect.top) / state.cellSize[1]);
        
        // Only return position if within grid bounds
        if (x < 0 || x >= state.size[0] || y < 0 || y >= state.size[1]) {
            return null;
        }
        
        return [x, y];
    };
    
    container.addEventListener('click', (e) => {
        // If already rearranged, any click returns to original
        if (state.isRearranged) {
            returnToOriginal();
            return;
        }
        
        const pos = getGridPosition(e);
        
        // Ignore clicks outside the grid
        if (!pos) return;
        
        // Check if clicking on an existing point
        const clickedIndex = state.points.findIndex(p => p[0] === pos[0] && p[1] === pos[1]);
        
        if (clickedIndex !== -1) {
            // Clicked on existing point - trigger rearrangement
            rearrangePoints(clickedIndex);
        } else {
            // Clicked on empty space - add new point
            state.points.push(pos);
            dotCounter++;
            
            // After first cycle completes (10 dots placed), shuffle for all future dots
            if (isFirstCycle && dotCounter === MAX_DOTS) {
                isFirstCycle = false;
                currentLabelOrder = shuffleArray(allLabels);
            }
            
            // Remove oldest dot if we exceed MAX_DOTS
            if (state.points.length > MAX_DOTS) {
                state.points.shift();
                
                // Shuffle ALL labels after each dot is removed (every click after the 10th)
                if (!isFirstCycle) {
                    currentLabelOrder = shuffleArray(allLabels);
                }
            }
            
            // Rebuild all labels based on current positions (0-9)
            state.pointLabels = state.points.map((_, index) => getLabelForDotIndex(index));
            
            // Play short sound for the newly created label
            if (typeof cageSoundEngine !== 'undefined' && state.pointLabels.length > 0) {
                try {
                    const newLabel = state.pointLabels[state.pointLabels.length - 1];
                    cageSoundEngine.playTransitionSound(newLabel, 0.15); // Short 150ms sound
                } catch (err) {
                    console.error('Sound error:', err);
                }
            }
            
            state.curves = generateCurves(state.size, state.points);
            render();
        }
    });
    
    container.addEventListener('mousemove', (e) => {
        // Don't update cursor in rearranged mode
        if (state.isRearranged) return;
        
        const pos = getGridPosition(e);
        
        // Don't show cursor outside grid
        if (!pos) {
            state.cursor = null;
            render();
            return;
        }
        
        const exists = state.points.some(p => p[0] === pos[0] && p[1] === pos[1]);
        state.cursor = exists ? null : pos;
        render();
    });
}

// =======================
// CENTER CONTENT INJECTION
// =======================
// Function to inject content into the center area
// Can be called from outside to add text, images, or any HTML
function injectCenterContent(htmlContent) {
    const centerContent = document.getElementById('center-content');
    if (centerContent) {
        centerContent.innerHTML = htmlContent;
    }
}

// Expose function globally for external use
window.injectCenterContent = injectCenterContent;

// =======================
// RESIZE HANDLER
// =======================
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (width <= 414) {
        state.size = [32, 56];
    } else {
        state.size = [64, 88];
    }
    
    state.cellSize = [width / state.size[0], height / state.size[1]];
    
    // Regenerate curves
    if (state.points.length > 0) {
        state.curves = generateCurves(state.size, state.points);
    }
    
    // Use appropriate render function based on state
    if (state.isRearranged) {
        // Recalculate display points based on new cell size
        if (state.originalPoints.length > 0) {
            state.displayPoints = state.displayPoints.map((_, index) => {
                if (index === state.selectedPointIndex) {
                    return [50, 50]; // Keep selected at top-left
                } else {
                    // Recalculate edge positions
                    const originalPixel = gridToPixel(state.originalPoints[index]);
                    return getClosestEdge(originalPixel).pos;
                }
            });
        }
        renderRearranged();
    } else {
        render();
    }
}

// =======================
// INITIALIZATION
// =======================
function init() {
    handleResize();
    setupMouse();
    window.addEventListener('resize', handleResize);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
