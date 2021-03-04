const fs = require('fs')

const { samples, lspSamples } = require('./samples')

const TABLE_HEAD = `<!-- SAMPLES_BEGIN -->
| Sample | Guide on VS Code Website | API & Contribution |
| ------ | ----- | --- |`
const TABLE_END = `<!-- SAMPLES_END -->`
const LSP_TABLE_HEAD = `<!-- LSP_SAMPLES_BEGIN -->
| Sample | Guide on VS Code Website | API & Contribution |
| ------ | ----- | --- |`
const LSP_TABLE_END = `<!-- LSP_SAMPLES_END -->`

const getTableRow = sample => {
  const descriptionCell = `[${sample.description}](https://github.com/Microsoft/vscode-extension-samples/tree/main/${sample.path})`
  let guideCell
  if (!sample.guide) {
    guideCell = 'N/A'
  } else if (sample.guide && sample.guide.startsWith('http')) {
    guideCell = sample.guide
  } else {
    guideCell = `[${sample.guide}](https://code.visualstudio.com${sample.guide})`
  }

  const apis = sample.apis.map(api => {
    return `[${api}](https://code.visualstudio.com/api/references/vscode-api#${api})`
  })
  const contributions = sample.contributions.map(c => {
    return `[contributes.${c}](https://code.visualstudio.com/api/references/contribution-points#contributes.${c})`
  })
  const apiAndContributionCell = apis.concat(contributions).join('<br>')

  return `| ${descriptionCell} | ${guideCell} | ${apiAndContributionCell} |`
}

const getSamplesTable = samples => {
  const samplesMd = samples.map(s => getTableRow(s)).join('\n')

  return `${TABLE_HEAD.trim()}
${samplesMd}
${TABLE_END.trim()}`
}

const getLSPSamplesTable = samples => {
  const samplesMd = samples.map(s => getTableRow(s)).join('\n')

  return `${LSP_TABLE_HEAD.trim()}
${samplesMd}
${LSP_TABLE_END.trim()}`
}

const readme = fs.readFileSync('README.md', 'utf-8')
const newReadme = readme
  .replace(/<!-- SAMPLES_BEGIN -->(.|\n)*<!-- SAMPLES_END -->/gm, getSamplesTable(samples.filter(x => !x.excludeFromReadme)))
  .replace(/<!-- LSP_SAMPLES_BEGIN -->(.|\n)*<!-- LSP_SAMPLES_END -->/gm, getLSPSamplesTable(lspSamples))

fs.writeFileSync('README.md', newReadme)
