document.addEventListener("DOMContentLoaded", () => {
  loadKeywords();
  updateStats();

  document.getElementById("addKeyword").addEventListener("click", addKeyword);
  document.getElementById("newKeyword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 폼 제출 방지
      addKeyword();
    }
  });

  document
    .getElementById("uploadBtn")
    .addEventListener("click", handleFileUpload);
  document
    .getElementById("clearFileKeywords")
    .addEventListener("click", clearFileKeywords);
  document
    .getElementById("clearCustomKeywords")
    .addEventListener("click", clearCustomKeywords);
});

// 스토리지 구조 변경
// {
//   fileKeywords: ['keyword1', 'keyword2', ...],  // 파일에서 가져온 키워드
//   customKeywords: ['keyword3', 'keyword4', ...] // 직접 등록한 키워드
// }

async function handleFileUpload() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("파일을 선택해주세요.");
    return;
  }

  const text = await file.text();
  const keywords = text
    .split(/\r?\n/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  // 중복 제거
  const uniqueKeywords = [...new Set(keywords)];

  chrome.storage.sync.get(["fileKeywords", "customKeywords"], (result) => {
    const existingFileKeywords = result.fileKeywords || [];
    const allFileKeywords = [
      ...new Set([...existingFileKeywords, ...uniqueKeywords]),
    ];

    chrome.storage.sync.set({ fileKeywords: allFileKeywords }, () => {
      updateStats();
      fileInput.value = "";
      alert(`파일에서 ${uniqueKeywords.length}개의 키워드를 추가했습니다.`);
    });
  });
}

function addKeyword() {
  const input = document.getElementById("newKeyword");
  const keyword = input.value.trim();

  if (keyword) {
    chrome.storage.sync.get(["customKeywords", "fileKeywords"], (result) => {
      const customKeywords = result.customKeywords || [];
      const fileKeywords = result.fileKeywords || [];

      // 이미 파일이나 직접 등록된 키워드에 있는지 확인
      if (
        !customKeywords.includes(keyword) &&
        !fileKeywords.includes(keyword)
      ) {
        customKeywords.push(keyword);
        chrome.storage.sync.set({ customKeywords }, () => {
          loadKeywords();
          updateStats();
          input.value = "";
        });
      } else {
        alert("이미 등록된 키워드입니다.");
      }
    });
  }
}

function loadKeywords() {
  const listElement = document.getElementById("keywordList");
  listElement.innerHTML = "";

  chrome.storage.sync.get(["customKeywords"], (result) => {
    const customKeywords = result.customKeywords || [];

    customKeywords.forEach((keyword) => {
      const item = document.createElement("div");
      item.className = "keyword-item";

      const text = document.createElement("span");
      text.textContent = keyword;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.onclick = () => deleteKeyword(keyword);

      item.appendChild(text);
      item.appendChild(deleteBtn);
      listElement.appendChild(item);
    });
  });
}

function deleteKeyword(keyword) {
  chrome.storage.sync.get(["customKeywords"], (result) => {
    const customKeywords = result.customKeywords || [];
    const newKeywords = customKeywords.filter((k) => k !== keyword);
    chrome.storage.sync.set({ customKeywords: newKeywords }, () => {
      loadKeywords();
      updateStats();
    });
  });
}

function updateStats() {
  chrome.storage.sync.get(["fileKeywords", "customKeywords"], (result) => {
    const fileKeywords = result.fileKeywords || [];
    const customKeywords = result.customKeywords || [];

    document.getElementById(
      "fileStats"
    ).textContent = `파일에서 가져온 키워드: ${fileKeywords.length}개`;
    document.getElementById(
      "customStats"
    ).textContent = `직접 등록한 키워드: ${customKeywords.length}개`;
    document.getElementById("totalStats").textContent = `총 키워드: ${
      fileKeywords.length + customKeywords.length
    }개`;
  });
}

// content.js에서 사용할 수 있도록 모든 키워드를 합친 배열을 반환하는 함수
function getAllKeywords(callback) {
  chrome.storage.sync.get(["fileKeywords", "customKeywords"], (result) => {
    const fileKeywords = result.fileKeywords || [];
    const customKeywords = result.customKeywords || [];
    callback([...new Set([...fileKeywords, ...customKeywords])]);
  });
}

// 파일 키워드 전체 삭제 함수
function clearFileKeywords() {
  if (confirm("파일에서 가져온 모든 키워드를 삭제하시겠습니까?")) {
    chrome.storage.sync.get(["fileKeywords"], (result) => {
      const count = (result.fileKeywords || []).length;

      chrome.storage.sync.set({ fileKeywords: [] }, () => {
        updateStats();
        alert(`파일 키워드 ${count}개가 삭제되었습니다.`);
      });
    });
  }
}

// 직접 등록 키워드 전체 삭제 함수
function clearCustomKeywords() {
  chrome.storage.sync.get(["customKeywords"], (result) => {
    const count = (result.customKeywords || []).length;

    if (count === 0) {
      alert("삭제할 키워드가 없습니다.");
      return;
    }

    if (confirm(`직접 등록한 키워드 ${count}개를 모두 삭제하시겠습니까?`)) {
      chrome.storage.sync.set({ customKeywords: [] }, () => {
        loadKeywords(); // 화면에 표시된 키워드 목록 갱신
        updateStats();
        alert(`직접 등록한 키워드 ${count}개가 삭제되었습니다.`);
      });
    }
  });
}
