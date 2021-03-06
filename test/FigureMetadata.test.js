import { test } from 'substance-test'
import {
  getEditorSession, getSelection, loadBodyFixture, openContextMenuAndFindTool,
  openManuscriptEditor, selectNode, openMenuAndFindTool
} from './shared/integrationTestHelpers'
import setupTestApp from './shared/setupTestApp'

const addMetadataFieldToolSelector = '.sm-add-metadata-field'
const moveDownMetadataFieldToolSelector = '.sm-move-down-metadata-field'
const moveUpMetadataFieldToolSelector = '.sm-move-up-metadata-field'
const removeMetadataFieldToolSelector = '.sm-remove-metadata-field'

const metadataFieldSelector = '.sc-metadata-field'
const metadataFieldInputSelector = '.sc-metadata-field .sc-text-input'
const metadataFieldNameSelector = '.sc-metadata-field .se-field-name .se-input'

const FIXTURE = `
  <fig-group id="fig1">
    <fig id="fig1a">
      <graphic />
      <caption>
        <p id="fig1a-caption-p1"></p>
      </caption>
      <kwd-group>
        <label>Field I</label>
        <kwd>Value A</kwd>
        <kwd>Value B</kwd>
      </kwd-group>
    </fig>
  </fig-group>
`

test('Figure Metadata: figure with custom fields', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  loadBodyFixture(editor, FIXTURE)
  t.notNil(editor.find(metadataFieldSelector), 'there should be a figure with metadata in manuscript')
  const fields = editor.findAll(metadataFieldInputSelector)
  t.equal(fields.length, 2, 'there should be two inputs')
  t.equal(fields[0].getTextContent(), 'Field I', 'shoud be keyword label inside first')
  t.equal(fields[1].getTextContent(), 'Value A, Value B', 'shoud be values joined with comma inside second')
  t.end()
})

test('Figure Metadata: add a new custom field', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  loadBodyFixture(editor, FIXTURE)
  t.equal(editor.findAll(metadataFieldSelector).length, 1, 'there should be one custom field')
  _selectCustomField(editor)
  const addMetadataFieldTool = openContextMenuAndFindTool(editor, addMetadataFieldToolSelector)
  t.ok(addMetadataFieldTool.click(), 'clicking on add custom field tool should not throw error')
  t.equal(editor.findAll(metadataFieldSelector).length, 2, 'there should be two custom fields now')
  const selectedNodePath = getSelection(editor).path
  const secondCustomFieldInputPath = editor.findAll(metadataFieldNameSelector)[1].getPath()
  t.deepEqual(selectedNodePath, secondCustomFieldInputPath, 'selection path and second custom field path should match')
  t.end()
})

test('Figure Metadata: add a new custom field when figure is selected', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  loadBodyFixture(editor, FIXTURE)
  t.equal(editor.findAll(metadataFieldSelector).length, 1, 'there should be one custom field')
  selectNode(editor, 'fig1')
  const addMetadataFieldTool = openContextMenuAndFindTool(editor, addMetadataFieldToolSelector)
  t.isNotNil(addMetadataFieldTool, 'add custom field tool should be available for a figure selection')
  t.ok(addMetadataFieldTool.click(), 'clicking on add custom field tool should not throw error')
  t.equal(editor.findAll(metadataFieldSelector).length, 2, 'there should be two custom fields now')
  const selectedNodePath = getSelection(editor).path
  const secondCustomFieldInputPath = editor.findAll(metadataFieldNameSelector)[1].getPath()
  t.deepEqual(selectedNodePath, secondCustomFieldInputPath, 'selection path and second custom field path should match')
  t.end()
})

test('Figure Metadata: remove custom field', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)
  loadBodyFixture(editor, FIXTURE)
  t.equal(editor.findAll(metadataFieldSelector).length, 1, 'there should be one custom field')
  _selectCustomField(editor)
  const removeMetadataFieldTool = openContextMenuAndFindTool(editor, removeMetadataFieldToolSelector)
  t.ok(removeMetadataFieldTool.click(), 'clicking on remove custom field tool should not throw error')
  t.equal(editor.findAll(metadataFieldSelector).length, 0, 'there should be no custom fields now')
  t.end()
})

test('Figure Metadata: move custom field', t => {
  let { app } = setupTestApp(t, { archiveId: 'blank' })
  let editor = openManuscriptEditor(app)

  loadBodyFixture(editor, FIXTURE)
  t.comment('initial state')
  t.equal(editor.findAll(metadataFieldSelector).length, 1, 'there should be one custom field')
  _selectCustomField(editor)
  t.notOk(_canMoveFieldUp(editor), 'move up should be disabled')
  t.notOk(_canMoveFieldDown(editor), 'move down should be disabled')

  t.comment('adding a new field')
  // Add a new one should put a selection on latest item
  t.ok(_addField(editor), 'adding a field should not throw')
  t.ok(_canMoveFieldUp(editor), 'move up should be disabled')
  t.notOk(_canMoveFieldDown(editor), 'move down should be disabled')

  t.comment('move field up')
  t.ok(_moveFieldUp(editor), 'move up should not throw')
  t.notOk(_canMoveFieldUp(editor), 'move up should be disabled')
  t.ok(_canMoveFieldDown(editor), 'move down should be disabled')

  t.comment('adding another field')
  t.ok(_addField(editor), 'adding a field should not throw')

  t.comment('move field up')
  t.ok(_moveFieldUp(editor), 'move up should not throw')
  t.ok(_canMoveFieldUp(editor), 'move up should be disabled')
  t.ok(_canMoveFieldDown(editor), 'move down should be disabled')

  t.comment('move field down')
  t.ok(_moveFieldDown(editor), 'move down should not throw')
  t.ok(_canMoveFieldUp(editor), 'move up should be disabled')
  t.notOk(_canMoveFieldDown(editor), 'move down should be disabled')

  t.end()
})

// Puts a selection on a N-th custom fields
function _selectCustomField (el, pos) {
  pos = pos || 0
  const customFieldEl = el.findAll(metadataFieldSelector)[pos]
  const surfaceEl = customFieldEl.find('.sc-surface')
  const surfaceId = surfaceEl.getSurfaceId()
  const path = surfaceEl.getPath()
  let editorSession = getEditorSession(el)
  editorSession.setSelection({
    type: 'property',
    path,
    surfaceId,
    startOffset: 0
  })
}

function _canMoveFieldUp (editor) {
  let tool = openMenuAndFindTool(editor, 'context-tools', moveUpMetadataFieldToolSelector)
  return tool && !tool.attr('disabled')
}

function _canMoveFieldDown (editor) {
  let tool = openMenuAndFindTool(editor, 'context-tools', moveDownMetadataFieldToolSelector)
  return tool && !tool.attr('disabled')
}

function _addField (editor) {
  let tool = openContextMenuAndFindTool(editor, addMetadataFieldToolSelector)
  return tool.el.click()
}

function _moveFieldUp (editor) {
  let tool = openMenuAndFindTool(editor, 'context-tools', moveUpMetadataFieldToolSelector)
  return tool.el.click()
}

function _moveFieldDown (editor) {
  let tool = openMenuAndFindTool(editor, 'context-tools', moveDownMetadataFieldToolSelector)
  return tool.el.click()
}
