const fs = require('fs')

const SAMPLES = require('./samples')

const TABLE_HEAD = `
<!-- SAMPLES_BEGIN -->
| Sample | Guide on VS Code Website | API & Contribution |
| ------ | ----- | --- |
`

const TABLE_END = `
<!-- SAMPLES_END -->
`

const getTableRow = (sample) => {
	const descriptionCell = `[${sample.description}](${sample.path})`
	const guideCell = sample.guide ? `[${sample.guide}](https://vscode-ext-docs.azurewebsites.net${sample.guide})` : 'N/A'

	const apis = sample.apis.map(api => {
		return `[${api}](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#${api})`
	})
	const contributions = sample.contributions.map(c => {
		return `[${c}](https://vscode-ext-docs.azurewebsites.net/api/references/contribution-points#${c})`
	})
	const apiAndContributionCell = apis.concat(contributions).join('<br>')

	return `| ${descriptionCell} | ${guideCell} | ${apiAndContributionCell} |`
}

const getSamplesTable = (samples) => {
	const samplesMd = samples
		.map(s => getTableRow(s))
		.join('\n')

	return `
${TABLE_HEAD.trim()}
${samplesMd}
${TABLE_END.trim()}
`

}

const readme = fs.readFileSync('README.md', 'utf-8')
const newReadme = readme.replace(/<!-- SAMPLES_BEGIN -->(.|\n)*<!-- SAMPLES_END -->/gm, getSamplesTable(SAMPLES))

fs.writeFileSync('README.md', newReadme)