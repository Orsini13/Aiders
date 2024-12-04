(() => {
    // Configuration Constants
    const CONFIG = {
        SELECTORS: {
            TOP_UTIL_ELEMENTS: ".bHJ",
            BODY: "body",
            SUMMARIZE_BUTTON: "#aiders-summarize-button",
            MODAL_OVERLAY: "#modalOverlay",
            CLOSE_MODAL_BTN: "#closeModalBtn",
            REGENERATE_BUTTON: "#aiders-regenerate-button",
        },
        CLASSES: {
            HIDDEN: "!hidden",
            MODAL_OVERLAY:
                "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50",
            SUMMARIZE_BUTTON: "aider-grad-1 text-sm text-white font-semibold",
            LOADING_OVERLAY: "aider-loader mr-2",
        },
    };

    // Content Extraction Module
    const ContentExtractor = {
        CONTENT_SELECTORS: [
            'div[role="listitem"] div[role="textbox"]',
            'div[data-message-id] div[role="textbox"]',
            'div[class*="a3s"][class*="aiL"]',
            ".a3s.aiL",
            'div[role="dialog"] div[role="textbox"]',
            'div[id^="m_"] > div',
            ".gs > .ii.gt div.a3s",
            '[data-message-id] [role="region"]',
            ".a3s",
            ".ii.gt .a3s",
        ],

        extractContent() {
            for (const selector of this.CONTENT_SELECTORS) {
                const elements = document.querySelectorAll(selector);

                if (elements.length > 0) {
                    const contents = Array.from(elements)
                        .map((el) => {
                            const texts = [
                                el.innerText,
                                el.textContent,
                                el.getAttribute("aria-label"),
                                el.innerHTML,
                            ];
                            return texts.find(
                                (text) => text && text.trim().length > 0
                            );
                        })
                        .filter(Boolean);

                    if (contents.length > 0) {
                        return contents.join("\n\n");
                    }
                }
            }

            return null;
        },
    };

    // UI Management Module
    const UIManager = {
        createSummarizeButton(onClick) {
            const summarizeButton = document.createElement("button");
            summarizeButton.textContent = "Summarize";
            summarizeButton.className = CONFIG.CLASSES.SUMMARIZE_BUTTON;
            summarizeButton.setAttribute("id", "aiders-summarize-button");
            summarizeButton.addEventListener("click", onClick);
            return summarizeButton;
        },

        createLoadingOverlay() {
            const loadingOverlay = document.createElement("div");
            loadingOverlay.className = CONFIG.CLASSES.LOADING_OVERLAY;
            loadingOverlay.setAttribute("id", "aider-loading-overlay");
            return loadingOverlay;
        },

        createSummaryModal(result, onRegenerate, onClose) {
            const resultModal = document.createElement("div");
            resultModal.className = CONFIG.CLASSES.MODAL_OVERLAY;
            resultModal.setAttribute("id", "modalOverlay");

            resultModal.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
                    <div class="flex justify-between items-center mb-4 bg-[#F7F9FB] px-3">
                        <p class="py-3 text-lg text-[#202124] w-full rounded-t-lg font-bold">
                            Aiders
                        </p>
                        <button
                            id="closeModalBtn"
                            class="text-gray-500 text-lg uppercase hover:text-gray-900"
                        >
                            &times;
                        </button>
                    </div>
                    <div class="flex flex-col max-h-full justify-start items-center w-full py-1 px-5 space-y-3">
                        <p class="font-semibold mr-auto">Summary</p>
                        <p class="text-gray-700 break-words overflow-y-auto max-h-[200px] pl-2 pr-8 aider-custom-scrollbar">
                            ${this.sanitizeHTML(result)}
                        </p>
                        <p class="w-full bg-gray-200 p-[0.05rem]"></p>
                        <section class="flex w-full justify-between items-center py-2">
                            <button id="aiders-copy-button" class="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                                Copy
                                <img src="chrome-extension://${
                                    chrome.runtime.id
                                }/assets/copy.svg" alt="Copy" class="w-4 ml-1"/>
                            </button>
                            <button
                                id="aiders-regenerate-button"
                                class="aider-grad-1 text-sm text-white font-semibold px-4 py-2 rounded"
                            >
                                Regenerate
                            </button>
                        </section>
                    </div>
                </div>
            `;

            // Setup event listeners
            const copyButton = resultModal.querySelector("#aiders-copy-button");
            copyButton.addEventListener("click", () =>
                this.copyToClipboard(result)
            );

            const regenerateButton = resultModal.querySelector(
                "#aiders-regenerate-button"
            );
            regenerateButton.addEventListener("click", onRegenerate);

            const closeButton = resultModal.querySelector("#closeModalBtn");
            closeButton.addEventListener("click", onClose);

            return resultModal;
        },

        sanitizeHTML(text) {
            // Basic HTML sanitization to prevent XSS
            const div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        },

        copyToClipboard(text) {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    this.showTemporaryToast("Copied to clipboard!");
                })
                .catch((err) => {
                    console.error("Copy failed:", err);
                    this.showTemporaryToast("Copy failed", true);
                });
        },

        showTemporaryToast(message, isError = false) {
            const toast = document.createElement("div");
            toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded 
                ${isError ? "bg-red-500 text-white" : "bg-green-500 text-white"}
                z-[100] transition-all duration-300`;
            toast.textContent = message;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add("opacity-0");
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 2000);
        },

        resetComponents() {
            const loadingOverlay = document.getElementById(
                "aider-loading-overlay"
            );
            const summarizeButton = document.getElementById(
                "aiders-summarize-button"
            );

            if (loadingOverlay && summarizeButton) {
                loadingOverlay.classList.add(CONFIG.CLASSES.HIDDEN);
                summarizeButton.classList.remove(CONFIG.CLASSES.HIDDEN);
            }
        },
    };

    // AI Summarization Module
    const SummarizationService = {
        async getSummarizer() {
            try {
                const canSummarize = await ai.summarizer.capabilities();

                if (!canSummarize || canSummarize.available === "no") {
                    throw new Error("Summarization not available");
                }

                const summarizer = await ai.summarizer.create();

                if (canSummarize.available !== "readily") {
                    summarizer.addEventListener("downloadprogress", (e) => {
                        console.log(
                            `Download progress: ${e.loaded}/${e.total}`
                        );
                    });
                    await summarizer.ready;
                }

                return summarizer;
            } catch (error) {
                console.error("Summarizer initialization error:", error);
                throw error;
            }
        },

        async generateSummary(emailContent) {
            if (!emailContent) return "No content found to summarize.";

            try {
                const summarizer = await this.getSummarizer();
                const summary = await summarizer.summarize(emailContent);
                const cleanedText = String(summary).replace(/\*/g, "");
                summarizer.destroy();

                const singleLineString = cleanedText
                    .replace(/\s*\n\s*/g, " ")
                    .trim();

                const prompt = `Rewrite the following in a paragraphed form, maintaining the tone: ${singleLineString}`;

                const session = await ai.languageModel.create();
                return await session.prompt(prompt);

                const rewriter = await ai.rewriter.create();
                return await rewriter.rewrite(singleLineString, {
                    context:
                        "Avoid any toxic language and be as constructive as possible.",
                });
            } catch (error) {
                console.error("Summary generation error:", error);
                return "Failed to generate summary. Please try again.";
            }
        },
    };

    // Main Extension Logic
    function initializeExtension() {
        // Message Listener
        chrome.runtime.onMessage.addListener((obj, sender, response) => {
            const { type } = obj;

            if (type === "NEW") {
                addSummarizeButton();
            }
        });

        // MutationObserver to handle dynamic content
        const observer = new MutationObserver((mutations) => {
            const topUtilElements = document.querySelector(
                CONFIG.SELECTORS.TOP_UTIL_ELEMENTS
            );
            if (
                topUtilElements &&
                !document.querySelector(CONFIG.SELECTORS.SUMMARIZE_BUTTON)
            ) {
                addSummarizeButton();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    // Add Summarize Button
    function addSummarizeButton() {
        const topUtilElements = document.querySelector(
            CONFIG.SELECTORS.TOP_UTIL_ELEMENTS
        );

        if (
            topUtilElements &&
            !document.querySelector(CONFIG.SELECTORS.SUMMARIZE_BUTTON)
        ) {
            const summarizeButton = UIManager.createSummarizeButton(() =>
                summarizeEmail(topUtilElements)
            );
            topUtilElements.prepend(summarizeButton);
        }
    }

    // Summarize Email Process
    async function summarizeEmail(utilEl) {
        // Show loading
        const loadingOverlay = UIManager.createLoadingOverlay();
        utilEl.prepend(loadingOverlay);
        document
            .querySelector(CONFIG.SELECTORS.SUMMARIZE_BUTTON)
            .classList.add(CONFIG.CLASSES.HIDDEN);

        // Extract and summarize content
        const emailContent = ContentExtractor.extractContent();
        let summaryResult = "";

        try {
            summaryResult = await SummarizationService.generateSummary(
                emailContent
            );
            renderSummary(summaryResult, utilEl);
        } catch (error) {
            UIManager.showTemporaryToast("Failed to generate summary", true);
            UIManager.resetComponents();
        }
    }

    // Render Summary Modal
    function renderSummary(result, utilEl) {
        const modalOverlay = UIManager.createSummaryModal(
            result,
            // Regenerate callback
            () => {
                document.querySelector(CONFIG.SELECTORS.MODAL_OVERLAY).remove();
                summarizeEmail(utilEl);
            },
            // Close callback
            () => {
                document.querySelector(CONFIG.SELECTORS.MODAL_OVERLAY).remove();
                UIManager.resetComponents();
            }
        );

        document.querySelector(CONFIG.SELECTORS.BODY).append(modalOverlay);
        UIManager.resetComponents();
    }

    // Initialize the extension
    initializeExtension();
})();
