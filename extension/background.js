let currentEmail = null;

chrome.runtime.onInstalled.addListener(() => {});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === "complete" &&
        tab.url &&
        tab.url.includes("mail.google.com")
    ) {
        const parsedUrl = new URL(tab.url);
        const pathSegments = parsedUrl.href.split("#");

        let fragment = parsedUrl.hash.substring(1); // Remove the leading #
        let fragmentParams = new URLSearchParams(fragment.split("?")[1]);

        if (fragmentParams.has("compose")) {
            chrome.tabs.sendMessage(tabId, {
                type: "COMPOSE",
            });

            return;
        } else {
        }
        // Match email-specific URL patterns
        const emailUrlPatterns = [
            /^inbox\/[\w-]+$/,
            /^starred\/[\w-]+$/,
            /^snoozed\/[\w-]+$/,
            /^sent\/[\w-]+$/,
            /^drafts\/[\w-]+$/,
            /^imp\/[\w-]+$/,
            /^chats\/[\w-]+$/,
            /^scheduled\/[\w-]+$/,
            /^all\/[\w-]+$/,
            /^spam\/[\w-]+$/,
            /^trash\/[\w-]+$/,
            /^category\/[\w-]+\/[\w-]+$/,
            /^label\/[^/]+\/[\w-]+$/,
        ];

        const isEmailView =
            pathSegments[1] &&
            emailUrlPatterns.some((pattern) => pattern.test(pathSegments[1]));

        if (isEmailView) {
            let location = null;
            let locationName = null;

            // Extract location and location name
            const segments = pathSegments[1].split("/");
            if (
                segments.length === 3 &&
                (segments[0] === "category" || segments[0] === "label")
            ) {
                // For category and label patterns
                location = segments[0];
                locationName = segments[1];
            } else if (segments.length === 2) {
                // For other patterns like sent, drafts, etc.
                location = segments[0];
                locationName = segments[0];
            }

            const emailId = segments.pop();

            chrome.tabs.sendMessage(tabId, {
                type: "NEW",
                mailId: parsedUrl[1],
                emailId,
                location,
                locationName,
            });
        }
    }
});
