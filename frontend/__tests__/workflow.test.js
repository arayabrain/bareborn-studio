const dotenv = require("dotenv")

dotenv.config()

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return S4() + S4() + "-" + S4()
}

function sleep(time) {
  return new Promise((res) => {
    setTimeout(() => {
      res()
    }, time)
  })
}

const puppeteer = require("puppeteer")

describe("Google", () => {
  let browser
  let page
  const name = `Run Test ${guidGenerator()}`

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      timeout: 60000,
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1368, height: 768 })
  })

  afterAll(async () => {
    await browser.close()
  })

  it("Login", async () => {
    await page.goto(process.env.HOST_TEST)
    await page.waitForSelector('input[name="email"]')
    await page.type('input[name="email"]', process.env.ACCOUNT_TEST)
    await page.waitForSelector('input[name="password"]')
    await page.type('input[name="password"]', process.env.PASSWORD_TEST)
    await page.keyboard.press("Enter")
    await page.waitForNavigation()
    const html = await page.$eval("body", (e) => e.innerHTML)
    expect(html).toMatch("Workspaces")
  })

  it("Goto the page Workspaces", async () => {
    await page.waitForSelector('a[href="/console/workspaces"]')
    await page.click('a[href="/console/workspaces"]')
  })

  it("Create New Workspaces", async () => {
    await page.waitForSelector("button[id-test='buttonNewNodeData']")
    await page.evaluate(() => {
      document.querySelector("button[id-test='buttonNewNodeData']").click()
    })
    await page.waitForSelector("div[id-test='inputNameNodeData'] > input")
    await page.type("div[id-test='inputNameNodeData'] > input", name)
    await page.evaluate(() => {
      document.querySelector("button[id-test='buttonOkModalNodeData']").click()
    })
  })

  it("Add node data suite2p_file_convert", async () => {
    await page.waitForSelector("button[id-test='buttonWorkflow']")
    await page.evaluate(() => {
      document.querySelector("button[id-test='buttonWorkflow']").click()
    })
    await page.waitForSelector("li[id-test='Algorithm'] > div")
    await sleep(1000)
    await page.click("li[id-test='Algorithm'] > div")
    await sleep(1000)
    await page.waitForSelector("li[id-test='suite2p'] > div")
    await page.click("li[id-test='suite2p'] > div")
    await sleep(1000)
    await page.waitForSelector("li[id-test='suite2p_file_convert'] button")
    await page.click("li[id-test='suite2p_file_convert'] button")
  })

  it("View node suite2p_file_convert", async () => {
    await sleep(2000)
  })

  it("Back to Workspaces Page and Delete Data Test", async () => {
    await page.waitForSelector("button[id-test='buttonBackWorkspaces']")
    await page.click("button[id-test='buttonBackWorkspaces']")
    await sleep(1000)
    await page.waitForSelector(
      `button[id-test='buttonDelete${name.replaceAll(" ", "-")}']`,
    )
    await page.click(
      `button[id-test='buttonDelete${name.replaceAll(" ", "-")}']`,
    )
    await page.waitForSelector(
      'div[id-test="confirmDeleteWorkspace"] button[id-test="btnOk"]',
    )
    await page.click(
      'div[id-test="confirmDeleteWorkspace"] button[id-test="btnOk"]',
    )
  })
  it("Done Test", async () => {
    await sleep(2000)
  })
})
