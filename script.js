// Find the important page elements and store them in variables.
const textBox = document.querySelector("#confusingText");
const explainButton = document.querySelector("#explainButton");
const explanationText = document.querySelector("#explanationText");

// These terms are explained when the pasted message includes matching keywords.
const termDefinitions = [
  {
    term: "FAFSA",
    keywords: ["fafsa"],
    meaning: "A form students use to apply for college financial aid."
  },
  {
    term: "Dependency status",
    keywords: ["dependency status", "dependent", "independent student"],
    meaning: "Whether financial aid uses parent information, student information, or both."
  },
  {
    term: "Tax documents",
    keywords: ["tax document", "tax documents", "tax return", "w-2", "1099"],
    meaning: "Papers that show income and taxes, such as a tax return, W-2, or 1099."
  },
  {
    term: "Documentation",
    keywords: ["documentation", "documents", "records"],
    meaning: "Proof or paperwork used to confirm a fact."
  },
  {
    term: "EOD",
    keywords: ["eod", "end of day"],
    meaning: "End of day. Usually before the office or business day closes."
  },
  {
    term: "Remit",
    keywords: ["remit"],
    meaning: "Send or pay."
  },
  {
    term: "Health insurance claim",
    keywords: ["health insurance claim", "insurance claim", "claim"],
    meaning: "A bill sent to insurance asking the insurance company to pay its part."
  },
  {
    term: "Denied claim",
    keywords: ["claim was denied", "claim denied", "denied"],
    meaning: "Insurance is refusing to pay that claim right now."
  },
  {
    term: "Out of network",
    keywords: ["out of network", "out-of-network"],
    meaning: "The provider or service may not have a pricing agreement with your insurance plan."
  },
  {
    term: "Full balance",
    keywords: ["full balance", "full amount", "responsible for the balance"],
    meaning: "The provider may try to bill you for the remaining amount."
  },
  {
    term: "Appeal",
    keywords: ["appeal", "reconsideration"],
    meaning: "A request for the company or office to review the decision again."
  }
];

// These words help the app notice basic tasks in general messages.
const actionWords = ["send", "submit", "provide", "complete", "review", "sign", "upload", "call", "email", "respond", "pay", "remit"];

// This helper safely adds text to the page without treating it like HTML.
function addTextElement(parent, tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

// This helper creates one numbered output section.
function addSection(title, items) {
  const section = document.createElement("section");
  section.className = "explanation-section";

  addTextElement(section, "h3", title);

  if (items.length === 1) {
    addTextElement(section, "p", items[0]);
  } else {
    const list = document.createElement("ul");

    items.forEach(function(item) {
      addTextElement(list, "li", item);
    });

    section.appendChild(list);
  }

  explanationText.appendChild(section);
}

// Split a message into sentence-sized pieces so the app can scan it.
function getSentences(text) {
  return text
    .split(/[.!?]+/)
    .map(function(sentence) {
      return sentence.trim();
    })
    .filter(function(sentence) {
      return sentence.length > 0;
    });
}

// Find dictionary terms that appear in the user's message.
function findTerms(text) {
  const lowerText = text.toLowerCase();

  return termDefinitions.filter(function(termInfo) {
    return termInfo.keywords.some(function(keyword) {
      return lowerText.includes(keyword);
    });
  });
}

// Look for health-insurance clues.
function isInsuranceMessage(text) {
  return text.includes("insurance") || text.includes("claim") || text.includes("out of network") || text.includes("balance");
}

// Look for school money or student aid clues.
function isFinancialAidMessage(text) {
  return text.includes("fafsa") || text.includes("financial aid") || text.includes("dependency") || text.includes("student aid");
}

// Build a specific explanation for health-insurance denial messages.
function getInsurancePlan() {
  return {
    simpleExplanation: [
      "A medical bill was sent to your insurance company.",
      "Insurance is refusing to pay the bill right now.",
      "The problem may be that one provider or service was outside your insurance plan's normal network."
    ],
    impact: [
      "You may be billed for more money than expected.",
      "There may be an appeal deadline or bill due date.",
      "The amount may change if the claim is corrected, reprocessed, or appealed."
    ],
    requiredActions: [
      "Find the denial notice or Explanation of Benefits.",
      "Find the claim number, service date, provider name, denial reason, and appeal deadline.",
      "Compare the insurance notice with the provider's bill.",
      "Confirm which part was out of network: doctor, hospital, lab, imaging, anesthesia, or another service."
    ],
    nextSteps: [
      "Call insurance and ask for the denial reason, claim number, and appeal options.",
      "Call the provider's billing office and ask them to pause the bill while the claim is reviewed.",
      "Save the notice, bill, call dates, and names of people you speak with."
    ]
  };
}

// Build a specific explanation for FAFSA or financial-aid messages.
function getFinancialAidPlan() {
  return {
    simpleExplanation: [
      "The financial aid office cannot finish reviewing the file yet.",
      "They need more proof before deciding aid or updating the student's account.",
      "The missing item is usually a form, tax record, identity document, or parent/student information."
    ],
    impact: [
      "Financial aid may be delayed.",
      "A missed deadline can affect grants, loans, work-study, or the school bill.",
      "Wrong documents can cause another request from the financial aid office."
    ],
    requiredActions: [
      "Find the exact forms, names, tax years, and student ID number in the message.",
      "Check whether they need parent documents, student documents, or both.",
      "Gather the tax return, W-2, 1099, ID, or school form named in the message.",
      "Submit the documents through the school portal or official email address."
    ],
    nextSteps: [
      "Make a list of the exact documents requested.",
      "Upload or send the documents through the official school method.",
      "Ask the financial aid office what is still missing after you submit."
    ]
  };
}

// Build a practical fallback explanation for messages that do not match a known topic.
function getGeneralPlan(originalText) {
  return {
    simpleExplanation: [
      "The message is asking for a response, document, payment, appointment, decision, or other task.",
      "The useful parts are the sender, request, deadline, and response method."
    ],
    impact: [
      "Ignoring the message may delay something, create a fee, miss a deadline, or leave a request unfinished.",
      "If no deadline is listed, the sender needs to clarify when it is due."
    ],
    requiredActions: findGeneralActions(originalText),
    nextSteps: [
      "Write down the sender, request, deadline, and contact method.",
      "Reply with one direct question if any required detail is missing.",
      "Keep a copy of what you send."
    ]
  };
}

// Create simple required actions for general messages without copying the original wording.
function findGeneralActions(originalText) {
  const sentences = getSentences(originalText);
  const actions = [
    "Identify who sent the message.",
    "Identify the exact item, answer, payment, form, or appointment involved.",
    "Find the deadline or due date.",
    "Find where the response should go."
  ];

  const hasActionWord = sentences.some(function(sentence) {
    const lowerSentence = sentence.toLowerCase();

    return actionWords.some(function(word) {
      return lowerSentence.includes(word);
    });
  });

  if (hasActionWord) {
    actions.push("Prepare the requested item before replying.");
  }

  return actions;
}

// Choose the best plan for the pasted message.
function getExplanationPlan(originalText) {
  const lowerText = originalText.toLowerCase();

  if (isInsuranceMessage(lowerText)) {
    return getInsurancePlan();
  }

  if (isFinancialAidMessage(lowerText)) {
    return getFinancialAidPlan();
  }

  return getGeneralPlan(originalText);
}

// This function translates the message into five practical sections.
function translateConfusingMessage(originalText) {
  const sentences = getSentences(originalText);
  const foundTerms = findTerms(originalText);
  const explanationPlan = getExplanationPlan(originalText);

  explanationText.innerHTML = "";

  // Empty input still follows the same structured format.
  if (sentences.length === 0) {
    addSection("1. Simple explanation", ["No message has been pasted yet."]);
    addSection("2. Key terms explained", ["No terms to define yet."]);
    addSection("3. What this means for you", ["There is nothing to act on until text is added."]);
    addSection("4. What you need to do", ["Paste the confusing message into the text box."]);
    addSection("5. Next steps", ["Paste the message.", "Click Explain This."]);
    return;
  }

  addSection("1. Simple explanation", explanationPlan.simpleExplanation);

  addSection("2. Key terms explained", foundTerms.length > 0
    ? foundTerms.map(function(termInfo) {
      return termInfo.term + ": " + termInfo.meaning;
    })
    : ["No difficult terms from the built-in list were detected."]);

  addSection("3. What this means for you", explanationPlan.impact);
  addSection("4. What you need to do", explanationPlan.requiredActions);
  addSection("5. Next steps", explanationPlan.nextSteps.slice(0, 3));
}

// Run this code when the user clicks the button.
explainButton.addEventListener("click", function() {
  const userText = textBox.value.trim();
  translateConfusingMessage(userText);
});
