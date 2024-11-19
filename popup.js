document.addEventListener("DOMContentLoaded", () => {
  // 현재 상태 로드
  chrome.storage.sync.get(["enabled"], (result) => {
    document.getElementById("enableRemoval").checked = result.enabled !== false;
  });

  // 체크박스 이벤트
  document.getElementById("enableRemoval").addEventListener("change", (e) => {
    chrome.storage.sync.set({ enabled: e.target.checked });
    // 페이지 새로고침하여 변경사항 즉시 적용
    chrome.tabs.reload();
  });

  // 옵션 페이지 버튼
  document.getElementById("openOptions").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
});
