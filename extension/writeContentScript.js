(() => {
    // Constants
    const SELECTORS = {
        FORMAT_ICON: '[data-tooltip="Formatting options"]',
        BODY: "body",
        CLOSE_MODAL_BTN: "#closeComposeModalBtn",
        GENERATE_BTN: "#aiders-generate-button",
        USER_INPUT: "#user-compose-input",
        ERROR_MESSAGE: "#input-error",
        LENGTH_SELECT: "#length-select",
        TONE_SELECT: "#tone-select",
        GENERATED_COMPOSE: "#generated-compose",
        INSERT_COMPOSE: "#aiders-insert-button",
    };

    const MODAL_CLASSES = {
        OVERLAY:
            "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50",
        HIDDEN: "!hidden",
    };

    const LENGTH_DESCRIPTIONS = {
        short: "brief and to the point",
        medium: "moderately detailed",
        concise: "short and precise",
        long: "comprehensive and detailed",
        detailed: "very thorough and explanatory",
    };

    // Message Listener
    function setupMessageListener() {
        chrome.runtime.onMessage.addListener((obj, sender, response) => {
            const { type } = obj;

            if (type === "COMPOSE") {
                addComposeButton();
            }
        });
    }

    // Add Compose Button to Gmail Interface
    function addComposeButton() {
        const formatIcon = document.querySelectorAll(SELECTORS.FORMAT_ICON)[0];
        const existingComposeButton = document.getElementById(
            "aiders-compose-button"
        );

        if (formatIcon && !existingComposeButton) {
            const aidersComposeButton = createComposeButton();
            formatIcon.parentElement.classList.add("flex", "space-x-1");
            formatIcon.parentElement.prepend(aidersComposeButton);
        }
    }

    // Create Compose Button Element
    function createComposeButton() {
        const aidersComposeButton = document.createElement("img");
        aidersComposeButton.className =
            "w-4 transition-all duration-200 scale-pulse hover:scale-110";
        aidersComposeButton.setAttribute(
            "src",
            `chrome-extension://${chrome.runtime.id}/assets/write-icon.svg`
        );
        aidersComposeButton.id = "aiders-compose-button";
        aidersComposeButton.addEventListener(
            "click",
            createAndShowComposeModal
        );
        return aidersComposeButton;
    }

    // Create and Show Compose Modal
    function createAndShowComposeModal() {
        // Remove any existing modal first to prevent duplicates
        const existingModal = document.getElementById("compose-modal");
        if (existingModal) {
            existingModal.remove();
        }

        const composeModal = createComposeModalElement();
        document.querySelector(SELECTORS.BODY).append(composeModal);

        setupModalEventListeners(composeModal);
    }

    // Create Modal HTML Element
    function createComposeModalElement() {
        const composeModal = document.createElement("div");
        composeModal.className = MODAL_CLASSES.OVERLAY;
        composeModal.setAttribute("id", "compose-modal");
        composeModal.innerHTML = getModalHTML();
        return composeModal;
    }

    // Generate Modal HTML
    function getModalHTML() {
        return `
            <div class="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
                <div class="flex justify-between items-center mb-4 bg-[#F7F9FB] px-3">
                    <p class="py-3 text-lg text-[#202124] w-full rounded-t-lg font-bold">
                        Aiders
                    </p>
                    <button id="closeComposeModalBtn" class="text-gray-500 text-lg uppercase hover:text-gray-900">
                        &times;
                    </button>
                </div>
                <div class="flex flex-col max-h-full justify-start items-center w-full py-1 px-5 space-y-3">
                    <p class="font-semibold mr-auto">
                        Describe the Email's Purpose
                    </p>
                    <textarea
                        class="text-gray-700 text-sm break-words outline-none appearance-none overflow-y-auto p-2 w-full max-h-[200px] border border-gray-500 aider-custom-scrollbar"
                        rows="4"
                        id="user-compose-input"
                        placeholder="Enter a brief description, e.g., 'Invite users to upcoming webinar.'"
                    ></textarea>

                    <div class="flex w-full space-x-4">
                        <div class="flex-1">
                            <label for="tone-select" class="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                            <select id="tone-select" class="w-full p-2 border border-gray-300 rounded-md text-sm">
                                <option value="neutral">Neutral</option>
                                <option value="formal">Formal</option>
                                <option value="friendly">Friendly</option>
                                <option value="professional">Professional</option>
                                <option value="conversational">Conversational</option>
                                <option value="persuasive">Persuasive</option>
                            </select>
                        </div>

                        <div class="flex-1">
                            <label for="length-select" class="block text-sm font-medium text-gray-700 mb-1">Length</label>
                            <select id="length-select" class="w-full p-2 border border-gray-300 rounded-md text-sm">
                                <option value="short">Short</option>
                                <option value="medium">Medium</option>
                                <option value="long">Long</option>
                                <option value="concise">Concise</option>
                                <option value="detailed">Detailed</option>
                            </select>
                        </div>
                    </div>

                    <p id="input-error" class="text-red-500 text-sm w-full hidden">
                        Please enter a description before generating.
                    </p>

                    <p class="w-full bg-gray-200 p-[0.05rem]"></p>

                    <p class="mr-auto">Preview</p>

                    <p id="generated-compose" class="text-sm max-h-[10rem] h-full overflow-y-auto aider-custom-scrollbar">
                    </p>

                    <section class="flex w-full justify-end items-center py-2 space-x-2">
                    <button
                            id="aiders-insert-button"
                            class="aider-border-1 text-sm text-gray-900 bg-white font-semibold px-4 py-2"
                        >
                            Insert Response
                        </button>
                        <button id="aiders-generate-button" class="aider-grad-1 text-sm text-white font-semibold px-4 py-2 rounded">
                            Generate
                        </button>
                    </section>
                </div>
            </div>
        `;
    }

    // Setup Modal Event Listeners
    function setupModalEventListeners(modalOverlay) {
        const closeModalBtn = document.querySelector(SELECTORS.CLOSE_MODAL_BTN);
        const generateButton = document.querySelector(SELECTORS.GENERATE_BTN);
        const userInput = document.querySelector(SELECTORS.USER_INPUT);
        const errorMessage = document.querySelector(SELECTORS.ERROR_MESSAGE);
        const lengthSelect = document.querySelector(SELECTORS.LENGTH_SELECT);
        const toneSelect = document.querySelector(SELECTORS.TONE_SELECT);

        // Close modal event
        closeModalBtn.addEventListener("click", () => {
            modalOverlay.remove();
        });

        // Generate button event
        generateButton.addEventListener("click", () =>
            handleGeneration(
                userInput,
                errorMessage,
                toneSelect,
                lengthSelect,
                generateButton
            )
        );

        // Input validation event
        userInput.addEventListener("input", () => {
            if (userInput.value.trim() !== "") {
                errorMessage.classList.add(MODAL_CLASSES.HIDDEN);
            }
        });
    }

    // Handle Email Generation
    async function handleGeneration(
        userInput,
        errorMessage,
        toneSelect,
        lengthSelect,
        generateButton
    ) {
        const loader = createLoader();
        prepareGenerationUI(generateButton, loader, errorMessage, userInput);

        const inputValue = userInput.value.trim();
        const tone = toneSelect.value;
        const length = lengthSelect.value;

        if (inputValue === "") {
            handleInvalidInput(errorMessage, userInput);
            return;
        }

        try {
            const generatedEmail = await generateEmail(
                inputValue,
                tone,
                length
            );
            updateGeneratedContent(generatedEmail);
        } catch (error) {
            console.error("Email generation error:", error);
        } finally {
            restoreGenerationUI(generateButton, loader, userInput);
        }
    }

    // Create Loader Element
    function createLoader() {
        const loader = document.createElement("div");
        loader.className = "aider-loader mr-2";
        return loader;
    }

    // Prepare UI for Generation
    function prepareGenerationUI(
        generateButton,
        loader,
        errorMessage,
        userInput
    ) {
        generateButton.parentElement.prepend(loader);
        generateButton.classList.add(MODAL_CLASSES.HIDDEN);
        errorMessage.classList.add(MODAL_CLASSES.HIDDEN);
    }

    // Handle Invalid Input
    function handleInvalidInput(errorMessage, userInput) {
        errorMessage.classList.remove(MODAL_CLASSES.HIDDEN);
        userInput.focus();
    }

    // Generate Email
    async function generateEmail(inputValue, tone, length) {

        const lengthDescription =
            LENGTH_DESCRIPTIONS[length] || "moderately detailed";
        const prompt = `Write me an email body without a subject with a ${tone} tone about: ${inputValue}. The email should be ${lengthDescription}.`;

        const session = await ai.languageModel.create();
        return await session.prompt(prompt);
    }

    // Update Generated Content
    function updateGeneratedContent(generatedEmail) {
        document.querySelector(SELECTORS.GENERATED_COMPOSE).textContent =
            generatedEmail;

        document
            .querySelector("#aiders-insert-button")
            .addEventListener("click", () => {
                if (generatedEmail == "") return;
                document.querySelector(
                    'div[aria-label="Message Body"][contenteditable="true"]'
                ).textContent = generatedEmail;

                document.getElementById("compose-modal").remove();
            });
    }

    // Restore Generation UI
    function restoreGenerationUI(generateButton, loader, userInput) {
        userInput.value = "";
        generateButton.classList.remove(MODAL_CLASSES.HIDDEN);
        loader.classList.add(MODAL_CLASSES.HIDDEN);
    }

    // Initialize Extension
    function init() {
        setupMessageListener();
    }

    // Start the extension
    init();
})();
