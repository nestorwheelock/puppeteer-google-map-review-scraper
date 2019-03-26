exports.getReviewsCount = () => {
    const count = document.querySelector(".gm2-caption").textContent;
    return parseInt(count.match(/[0-9]*/g).join(""));
}

exports.getCurrentCount = () => {
    return document.querySelectorAll(".section-review-content").length;
}

exports.getPreviousHeight = () => {
    return document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show").scrollHeight;
}

exports.scrollToBottom = () => {
    let scrollbar = document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show");
    scrollbar.scrollTo(0, scrollbar.scrollHeight);
}

exports.getAllReviews = () => {
    const all_reviews = document.querySelectorAll(".section-review-review-content > .section-review-text");
    const result = [...all_reviews].map((e) => e.textContent);
    return result;
}