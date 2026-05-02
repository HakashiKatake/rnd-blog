import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home Settings')
        .id('homeSettings')
        .child(
          S.document()
            .schemaType('homeSettings')
            .documentId('homeSettings'),
        ),
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== 'homeSettings',
      ),
    ])
