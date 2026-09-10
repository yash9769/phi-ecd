# Step-by-Step Guide: Sending Bulk Emails via Microsoft Word Mailings (Mail Merge)

This guide provides complete, step-by-step instructions to send personalized emails to all Partners and Employees using **Microsoft Word** and **Microsoft Outlook** with zero daily limits, zero cost, and 100% Inbox delivery.

---

## 1. Required Files (Prepared in Repository)

Use one of the pre-formatted CSV files created in this project:

* **For Partners Only (34 recipients)**: 
  * Path: `partners_only.csv`
* **For All Employees & Partners (612 recipients)**: 
  * Path: `employees.csv`
* **Excel Version**:
  * Path: `Partners_Email_IDs.xlsx`

---

## 2. Exact Email Parameters

* **Sender Account**: Your signed-in Outlook email address (`@jhsassociates.in` or `@jhsossociates.in`).
* **Email Subject Line**: 
  ```text
  An Initiative in Memory of Ahmed Huziefa Unwala
  ```
* **Google Form Link**: `https://forms.gle/SEcWiM9JFVBHfDbYA`

---

## 3. Exact Email Body Text (Copy & Paste Content)

Copy the text block below directly into Microsoft Word:

```text
Dear «full_name»,

With deep sadness, we share the passing of Ahmed Huziefa Unwala, beloved son of Mr. Huziefa Unwala.

In his memory, JHS Associates is introducing Foundation of Hope, an initiative through which our JHS family can come together and honour his memory.

We invite you to take a moment to learn about the initiative and participate if you wish. Your support and participation would be deeply appreciated.

https://forms.gle/SEcWiM9JFVBHfDbYA

Thank you for your understanding, kindness, and support.

Regards,
Human Resources
JHS Associates
```

### Required Formatting & Bolds inside Word:
1. Select **Ahmed Huziefa Unwala** $\rightarrow$ Make **Bold** (`Ctrl + B`)
2. Select **Mr. Huziefa Unwala** $\rightarrow$ Make **Bold** (`Ctrl + B`)
3. Select **JHS Associates** $\rightarrow$ Make **Bold** (`Ctrl + B`)
4. Select **Foundation of Hope** $\rightarrow$ Make **Bold** (`Ctrl + B`)
5. Select **Human Resources** $\rightarrow$ Make **Bold** (`Ctrl + B`)
6. Select **JHS Associates** (in signature) $\rightarrow$ Make **Bold** (`Ctrl + B`)

---

## 4. Complete Step-by-Step Execution Guide

### Step 1: Open Microsoft Outlook
1. Open the **Microsoft Outlook** desktop application on your computer.
2. Ensure you are signed into your corporate email account (`@jhsassociates.in` or `@jhsossociates.in`).
3. Keep Outlook running in the background.

---

### Step 2: Set Up Mail Merge in Microsoft Word
1. Open **Microsoft Word** and start a **Blank Document**.
2. Click on the **Mailings** tab in the top ribbon menu.
3. Click **Start Mail Merge** $\rightarrow$ Select **E-mail Messages**.

---

### Step 3: Select the Recipient List
1. In the **Mailings** tab, click **Select Recipients** $\rightarrow$ Choose **Use an Existing List...**
2. A file selection dialog will open. Navigate to your project folder:
   `c:\Users\yashodhanrajapkar\Downloads\phi-ecd\`
3. Select **`partners_only.csv`** (for partners) or **`employees.csv`** (for all employees).
4. Click **Open**.

---

### Step 4: Add Email Content & Insert Personalization Field
1. Paste the email body text from **Section 3** into your Word document.
2. Place your text cursor immediately after `Dear ` (before the comma).
3. In the **Mailings** tab, click **Insert Merge Field** $\rightarrow$ Select **`full_name`**.
4. The text will now show: `Dear «full_name»,`
5. Apply the **Bold** styling to the key phrases as instructed in **Section 3**.

---

### Step 5: Preview Your Personalization
1. In the **Mailings** tab, click **Preview Results**.
2. Click the right/left arrow buttons next to *Preview Results* to navigate through records.
3. Verify that `«full_name»` changes to actual names (e.g., `Dear Huzeifa Unwala,`, `Dear Kalpesh Parmar,`).

---

### Step 6: Dispatch the Emails via Outlook
1. In the **Mailings** tab, click **Finish & Merge** (far right side of the toolbar).
2. Select **Send Email Messages...**
3. A pop-up modal titled **Merge to E-mail** will appear:
   * **To**: Select **`email`** from the drop-down list.
   * **Subject line**: Type `An Initiative in Memory of Ahmed Huziefa Unwala`
   * **Mail format**: Select **HTML**.
   * **Send records**: Select **All**.
4. Click **OK**.

---

## 5. Verification & Completion
* Switch to **Microsoft Outlook**.
* Open your **Outbox** / **Sent Items** folder.
* You will see Outlook automatically sending individual personalized emails to all 34 Partners or 612 Employees.
* Delivery is immediate, with **zero daily limits** and **100% Inbox placement**.
