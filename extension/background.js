let currentEmail = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension loaded successfully");
});

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

        console.log(fragmentParams);

        if (fragmentParams.has("compose")) {
            console.log(
                "The 'compose' parameter is present in the fragment:",
                fragmentParams.get("compose")
            );
            return;

            // COMPOSE ELEMENT
            //             let formatIcon = document.querySelectorAll('[data-tooltip="Formatting options"]')[0]
            // undefined
            // formatIcon
            // <div data-tooltip=​"Formatting options" aria-label=​"Formatting options">​…​</div>​flex<div id=​":​av" class=​"J-Z-I J-J5-Ji" role=​"button" aria-pressed=​"false" aria-haspopup=​"true" aria-expanded=​"false" style=​"user-select:​ none;​">​…​</div>​flex</div>​
            // formatIcon.parentElement.prepend(document.createElement("button"))
            // undefined
            // formatIcon.parentElement.prepend(document.createElement("button"))
        } else {
            console.log("NILLLLLLLL");
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
