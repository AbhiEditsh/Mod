document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('images');
    const previewList = document.getElementById('imagePreviewList');
    let selectedFiles = [];
    let draggedItem = null;

    if (imageInput && previewList) {
        // Handle file selection
        imageInput.addEventListener('change', function (e) {
            const files = Array.from(e.target.files);

            // Limit to 5 images
            if (selectedFiles.length + files.length > 5) {
                alert('Maximum 5 images allowed');
                return;
            }

            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        addImagePreview(e.target.result, file);
                    };
                    reader.readAsDataURL(file);
                    selectedFiles.push(file);
                }
            });

            updateInputFiles();
        });

        // Add image preview
        function addImagePreview(src, file) {
            const li = document.createElement('li');
            li.className = 'image-preview-item';
            li.draggable = true;
            li.innerHTML = `
                <img src="${src}" alt="Preview">
                <button type="button" class="delete-image">&times;</button>
            `;

            // Delete button handler
            li.querySelector('.delete-image').addEventListener('click', function () {
                const index = Array.from(previewList.children).indexOf(li);
                selectedFiles.splice(index, 1);
                li.remove();
                updateInputFiles();
            });

            // Drag and drop handlers
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragend', handleDragEnd);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('drop', handleDrop);

            previewList.appendChild(li);
        }

        // Update the file input with current selection
        function updateInputFiles() {
            const dataTransfer = new DataTransfer();
            selectedFiles.forEach(file => {
                dataTransfer.items.add(file);
            });
            imageInput.files = dataTransfer.files;
        }

        // Drag and drop functionality
        function handleDragStart(e) {
            draggedItem = this;
            this.classList.add('dragging');
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDrop(e) {
            e.preventDefault();
            if (draggedItem === this) return;

            const items = Array.from(previewList.children);
            const draggedIdx = items.indexOf(draggedItem);
            const droppedIdx = items.indexOf(this);

            // Swap files in selectedFiles array
            [selectedFiles[draggedIdx], selectedFiles[droppedIdx]] =
                [selectedFiles[droppedIdx], selectedFiles[draggedIdx]];

            // Swap DOM elements
            if (draggedIdx < droppedIdx) {
                this.parentNode.insertBefore(draggedItem, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedItem, this);
            }

            updateInputFiles();
        }
    }

    // Game categories configuration
    const gameCategories = {
        ETS2: ['Trucks', 'Trailers', 'Maps', 'Skins'],
        Snowrunner: ['Trucks', 'Maps', 'Addons', 'Fixes'],
        GTA5: ['Vehicles', 'Weapons', 'Scripts', 'Maps', 'Skins'],
        GMod: ['Addons', 'Maps', 'Weapons', 'NPCs', 'Tools'],
        Melon: ['Characters', 'Maps', 'Weapons', 'UI', 'Gameplay']
    };

    function updateCategories() {
        const gameSelect = document.getElementById('game');
        const categorySelect = document.getElementById('category');
        const selectedGame = gameSelect.value;

        // Clear current categories
        categorySelect.innerHTML = '<option value="">Select Category</option>';

        if (selectedGame) {
            // Enable category select
            categorySelect.disabled = false;

            // Add categories for selected game
            gameCategories[selectedGame].forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        } else {
            // Disable category select if no game selected
            categorySelect.disabled = true;
        }
    }

    // Initialize game select change handler
    const gameSelect = document.getElementById('game');
    if (gameSelect) {
        gameSelect.addEventListener('change', updateCategories);
        if (gameSelect.value) {
            updateCategories();
        }
    }
}); 