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
    const all_reviews = document.querySelectorAll(".section-review-content");
    const result = [...all_reviews].map((e) => {
        const author = e.querySelector(".section-review-title").textContent;
        const content = e.querySelector(".section-review-text").textContent;

        let rating = null;

        if (e.querySelector(".section-review-stars")) {
            rating = e.querySelector(".section-review-stars").getAttribute("aria-label");
        } else if (e.querySelector(".section-review-numerical-rating")) {
            rating = e.querySelector(".section-review-numerical-rating").textContent;
        }
        return { author, content, rating };
    });
    return result;
}