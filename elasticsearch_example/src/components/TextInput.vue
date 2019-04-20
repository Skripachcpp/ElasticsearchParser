<template>
    <input class="TextInput"
           type="text"
           :placeholder="placeholder"
           v-model="nextText"
           @input="handlerOnInput"
           @change="handlerOnChange"
           @keyup="handlerOnKeyup"
    />
</template>

<script>
export default {
  name: "TextInput",
  methods: {
    handlerOnKeyup(e) {
      this.$emit('keyup', e);
    },
    handlerOnInput(e) {
      let {filter, prevText, nextText, value} = this;
      this.change = true;

      if (filter) {
        let txt = filter(nextText, prevText);
        if (txt !== nextText) this.nextText = nextText = txt;
      }

      this.$emit('input', nextText, e);

      if (value !== undefined) {
        this.$nextTick(() => {
          let {prevText, nextText, value} = this;
          if (value === prevText && prevText !== nextText) this.nextText = prevText;
          else this.prevText = nextText;
        });
      }
    },
    handlerOnChange(e) {
      let {format, nextText} = this;
      if (format) this.prevText = this.nextText = format(nextText);

      this.$emit('change', nextText, e);
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(v) {
        let {format, nextText} = this;
        if (nextText !== v)
          this.prevText = this.nextText = format && format(v) || v;
      }
    },
    defaultValue: {
      immediate: true,
      handler(v) {
        let {value, change, nextText, filter, format} = this;
        if (value === undefined && !change) {
          if (filter) v = filter(v);

          if (nextText !== v)
            this.prevText = this.nextText = format && format(v) || v;
        }
      }
    },
  },
  data() {
    return {
      prevText: null,
      nextText: null,
      change: false,
    }
  },
  props: {
    placeholder: String,
    value: String,
    defaultValue: String,
    filter: Function,
    format: Function
  },
}
</script>
