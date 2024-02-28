(function () {
    // 获取当前页面的URL
    const currentPageUrl = window.location.href;

    // 获取页面中所有匹配的元素
    const elements = document.querySelectorAll(".text-title-large");

    // 检查是否有匹配的元素
    if (elements.length > 0) {
        const textContent = elements[0].innerText;
        const markdownLink = `# ${textContent}\n\n## 链接\n\n[${textContent}](${currentPageUrl})\n\n`;
        console.log(markdownLink);

        // 检查turndown是否已经在页面上加载
        function isTurndownLoaded() {
            return window.TurndownService !== undefined;
        }

        // 加载turndown并执行转换
        loadAndConvert(isTurndownLoaded, markdownLink);
    } else {
        console.log('No elements with class ".text-title-large" found.');
    }
})();

function loadAndConvert(isLoaded, markdownLink) {
    if (!isLoaded()) {
        var script = document.createElement('script');
        script.onload = function () {
            convertHtmlToMarkdown(markdownLink);
        };
        script.src = 'https://unpkg.com/turndown/dist/turndown.js';
        document.head.appendChild(script);
    } else {
        convertHtmlToMarkdown(markdownLink);
    }
}

function convertHtmlToMarkdown(markdownLink) {
    const trackElements = document.querySelectorAll('[data-track-load="description_content"]');
    trackElements.forEach((element) => {
        const htmlContent = element.innerHTML;
        const turndownService = new TurndownService();
        turndownService.keep(['pre'])
        let markdownContent = turndownService.turndown(htmlContent);
        markdownContent = markdownLink + `## 题目\n\n${markdownContent}\n\n## 解答\n\n`;
        navigator.clipboard.writeText(markdownContent).then(() => {
            console.log('Markdown content copied to clipboard.');
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
        });
    });
}
// https://minify-js.com
