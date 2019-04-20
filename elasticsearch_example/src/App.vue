<template>
    <div id="app">
        <NestedQuery/>
    </div>
</template>

<script>
import HtmlParser from './components/HtmlParser'
import NestedQuery from './components/NestedQuery'
import MultiindexQuery from './components/MultiindexQuery'

export default {
  name: "App",
  components: {HtmlParser, NestedQuery, MultiindexQuery}
}
</script>

<style lang="scss">
    #app {

    }

    em {
        color: black;
        font-weight: bold;
        font-size: 17px;
        font-style: normal;
    }
</style>
