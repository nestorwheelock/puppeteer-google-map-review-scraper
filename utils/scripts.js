/**
 * @return {number} returns the total number of reviews.
 */
const getReviewsCount = () => {
    const count = document.querySelector("div.gm2-caption").textContent;
    return parseInt(count.match(/[0-9]*/g).join(""));
}

/**
 * @return {number} returns the current count of reviews.
 */
const getCurrentCount = () => {
    return document.querySelectorAll(".section-review-content").length;
}

/**
 * @return {number} returns the scrollHeight.
 */
const getPreviousHeight = () => {
    return document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show").scrollHeight;
}

/**
 * scroll the scrollbar to the bottom
 */
const scrollToBottom = () => {
    let scrollbar = document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show");
    scrollbar.scrollTo(0, scrollbar.scrollHeight);
}

/**
 * @return {Array.<{author: string, content: string, rating: number}>} returns all reviews.
 */
const getAllReviews = () => {
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
        rating = rating.trim().match(/([0-9])[^0-9]/)[0];
        rating = parseInt(rating);
        return { author, content, rating };
    });
    return result;
}

module.exports = { getReviewsCount, getCurrentCount, getPreviousHeight, scrollToBottom, getAllReviews };