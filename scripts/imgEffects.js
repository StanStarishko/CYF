// Global variables to store the current element and settings
let launchedEffect = null;
let settings = {};

// Function to check if an image exists
async function checkImageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Function to calculate the width
function calculateImageWidth(imageUrl, fixedHeight) {
    return new Promise((resolve, reject) => {
        const img = new Image(); // Create a new Image object

        img.onload = function() {
            const originalWidth = img.naturalWidth;  // Original width of the image
            const originalHeight = img.naturalHeight; // Original height of the image

            // Calculate the width proportionally to the new height
            const calculatedWidth = Math.round((originalWidth / originalHeight) * fixedHeight);
            resolve(calculatedWidth); // Return the value (promise)
        };

        img.onerror = function() {
            reject('Error loading image'); // Handle image loading errors
        };

        img.src = imageUrl; // Set the image URL
    });
}

// Function to determine the effect based on index and modulo value
function getEffectForIndex(index, modulo) {
    return settings.imgEffects.effects[(index % modulo).toString()]; // Return the effect based on the index and modulo value
}

// Function to apply the effect
async function applyEffectForElement(element) {
    // Check if the element is already active
    if (launchedEffect === element) {
        return;
    }

    // Change the text colour
    element.querySelector('.text').style.color = settings.EffectColors.ActiveElEffect;

    // Reset the previous element
    if (launchedEffect) {
        const previousImage = document.getElementById('centralImage');
        if (previousImage) {
            previousImage.style.animation = ''; // Stop the animation
            previousImage.style.display = 'none'; // Hide the image
        }
        launchedEffect.querySelector('.text').style.color = settings.EffectColors.NotActiveElEffect; // Restore the original text colour
    }

    // Set the new element
    launchedEffect = element;

    // Get the last two characters of the element ID
    const id = element.id;
    const key = id.slice(-2); // Last two characters of the ID

    // Get the image file name from the JSON settings
    const imageName = settings.imgEffects.files[key];
    const imageUrl = `${settings.imgEffects.path}${imageName}`; // Generate the full image path

    // Check if the image exists
    const imageExists = await checkImageExists(imageUrl);

    // Prepare the image
    const image = document.getElementById('centralImage');
    if (imageExists) {
        const imgWidth = await calculateImageWidth(imageUrl, settings.imgEffects.fixedHeight);
        image.style.height = `${settings.imgEffects.fixedHeight}px`;
        image.style.width = `${imgWidth}px`;
        image.style.backgroundImage = `url(${imageUrl})`; // Set the image
        image.style.display = 'block'; // Show the image container
        const effIdx = getEffectForIndex(parseInt(key, 10), 3);
        image.className = `image-container ${effIdx}`; // Apply the required effect
    } else {
        image.style.display = 'none'; // Hide the container if the image does not exist
    }
}

function preventZoom() {
    document.body.style.zoom = "100%";
}

// Function to set up event listeners for the elements
function setupEventListeners() {
    window.addEventListener('resize', preventZoom);
    window.addEventListener('wheel', function(event) {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    }, { passive: false });

    document.querySelectorAll('.effect-list li').forEach(item => {
        // Attach mouseover event handler
        item.addEventListener('mouseover', () => {
            applyEffectForElement(item);
        });

        // Attach mouseout event handler
        item.addEventListener('mouseout', () => {
            if (launchedEffect === item) {
                const image = document.getElementById('centralImage');
                if (image) {
                    image.style.animation = ''; // Stop the animation
                    image.style.display = 'none'; // Hide the image
                }
                item.querySelector('.text').style.color = settings.EffectColors.NotActiveElEffect; // Restore the original text colour
                launchedEffect = null; // Reset the current element
            }
        });
    });
}

// Function to toggle the visibility of the central image container
function toggleImageContainer() {
    const container = document.querySelector('.image-wrapper');
    container.style.display = container.style.display === 'none' ? 'flex' : 'none';
}

function openDiv(nameDiv) {
    if (nameDiv === ".effect-list") {
        document.querySelector(".effect_list_wrapper").style.display = "flex";
        document.querySelector(nameDiv).style.display = "block";
        document.querySelector(nameDiv).style.color = settings.EffectColors.NotActiveElEffect; 
    } else {
        document.querySelectorAll("[class^='card']").forEach(function(element) {
            element.style.display = "flex";
        });
    }
    document.querySelector(".brief").style.zIndex = "1";
}

function closeDiv(nameDiv) {
    if (nameDiv === ".effect-list") {
        document.querySelector(".effect_list_wrapper").style.display = "none";
        document.getElementById('centralImage').style.display = "none";
    } else {
        document.querySelectorAll("[class^='card']").forEach(function(element) {
            element.style.display = "none";
        });
    }
    document.querySelector(".brief").style.zIndex = "2";
}

function defineButtonnsEvents () {
    // Close Image Div
    document.getElementById('closeImgEffects').addEventListener('click', function () {
        closeDiv('.effect-list');
    });

    // Open Imge Div
    document.getElementById('topFacts').addEventListener('click', function () {
        openDiv(".effect-list");
    });

    // Close Card Div
     document.getElementById('closeCard').addEventListener('click', function () {
        closeDiv('.card');
    });

    // Open Card Div
    document.getElementById('aboutMe').addEventListener('click', function () {
        openDiv(".card");
    });

    // Open external links for wiki and city history
    document.getElementById('wiki').addEventListener('click', function () {
        window.open('https://simple.wikipedia.org/wiki/Dnipro', '_blank');
    });

    document.getElementById('cityHistory').addEventListener('click', function () {
        window.open('https://www.encyclopediaofukraine.com/display.asp?linkpath=pages%5CD%5CN%5CDnipro.htm', '_blank');
    });
}

function getScreenResolution() {
    const width = window.screen.width;
    const height = window.screen.height;
    const aspectRatio = width / height;

    if (width > 1280) {
        document.querySelectorAll("[class^='buttons']").forEach(function(element) {
            //element.style.fontSize = "2lh";
            element.style.borderRadius = "32px";
        });
        document.body.style.fontSize = "1.5lh";
        //document.querySelector(".effect-list").style.width = "90%"
        //document.querySelector(".effect-list").style.height = "85%"
    }

    //console.log("Current zoom level: " + window.devicePixelRatio * 100 + "%");
    //console.log(`Screen resolution: ${width}x${height}`);
    //console.log(`Aspect ratio: ${aspectRatio.toFixed(2)}`);
}

// Load settings from settings.json file
fetch('settings.json')
    .then(response => response.json())
    .then(data => {
        settings = data; // Store the settings in a global variable
        setupEventListeners(); // Set up event listeners after loading the settings
        defineButtonnsEvents ();
        getScreenResolution()
    })
    .catch(error => console.error('Error loading settings:', error));
