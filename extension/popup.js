import { getActiveTabURL } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();

    if (activeTab.url.includes("mail.google.com")) {
        document.body.setAttribute("data-page", "gmail");
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML =
            '<div class="title">Email Assistant Ready!</div>';
    } else {
        document.body.setAttribute("data-page", "other");
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML =
            '<div class="title">Open Gmail to Use Extension</div>';
    }
});
