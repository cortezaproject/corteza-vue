# Guide for adding translations


## In general translations should be added by one of two ways:


1. A couple of them aren't translated like unnamed role because that one is always resolved in an ID

2. If components from a library need a translatable string, it should be passed on using props


* If there are just too many places in the webapp that are using a component from corteza-vue, that component should/could be wrapped with a local component that passes in the translation strings


3. If any of the components using translations do not fit into these rules, let's have a chat and address each one
