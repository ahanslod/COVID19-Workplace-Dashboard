<template>
  <div class="form w-1/4 m-12">
    <div class="w-full md:w-1/2 px-3 m-4" :key="i" v-for="(field, i) in fields">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
      >
        {{ field.label }}
      </label>
      <input
        :ref="field.id"
        v-model="field.value"
        :type="field.type ? field.type : 'input'"
        :id="field.id"
        :maxlength="field.max"
        :minlength="field.min"
        :step="field.steps"
        :class="[
          field.type
            ? 'bg-gray-200'
            : 'appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500',
          field.valid && field.value
            ? field.valid()
              ? ''
              : 'border-red-500'
            : ''
        ]"
      />
      <p
        v-if="field.valid && field.value ? !field.valid() : false"
        class="text-red-500 text-xs italic"
      >
        {{ field.invalidMessage ? field.invalidMessage : "Invalid value" }}
      </p>
    </div>
    <button
      :disabled="!formFinished"
      @click="submit"
      class="flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 rounded py-2 w-full transition duration-150 ease-in"
    >
      <span class="mr-2 uppercase">Submit</span>
    </button>
  </div>
</template>

<script>
export default {
  async mounted() {
    this.employeeIds = await this.$employeeIds();
  },
  computed: {
    formFinished() {
      const nulled = Object.values(this.values).map(val =>
        val === "" ? null : val
      );
      return !nulled.includes(null);
    },
    values() {
      return this.fields.reduce(
        (curr, next) => ({
          ...curr,
          [next.id]:
            next.valid && next.value
              ? next.valid()
                ? next.value
                : null
              : next.value
        }),
        {}
      );
    }
  },
  methods: {
    submit() {
      this.$axios.post(
        "http://localhost:3000/api/reports/screening",
        this.values
      );
      alert("Employee screening report has been submitted");
    }
  },
  data() {
    return {
      employeeIds: [],
      fields: [
        {
          label: "Employee Id",
          id: "employeeId",
          value: null,
          self: this,
          valid() {
            return this.self.employeeIds.includes(Number(this.value));
          }
        },
        {
          label: "Date Of Report",
          id: "dateOfReport",
          type: "date",
          value: new Date().toJSON().split("T")[0]
        },
        {
          label: "Temperature",
          id: "temperature",
          type: "number",
          value: null,
          steps: ".01",
          valid() {
            return this.value > 30 && this.value < 50;
          }
        },
        {
          label: "Has Recently Travelled",
          id: "hasRecentlyTravelled",
          type: "checkbox",
          value: false
        },
        {
          label: "Has Close Contact",
          id: "hasCloseContact",
          type: "checkbox",
          value: false
        },
        {
          label: "Has Caugh",
          id: "hasCough",
          type: "checkbox",
          value: false
        },
        {
          label: "Has Fever",
          id: "hasFever",
          type: "checkbox",
          value: false
        },
        {
          label: "Has Lethargy",
          id: "hasLethargy",
          type: "checkbox",
          value: false
        },
        {
          label: "Has Shortness Of Breath",
          id: "hasShortnessOfBreath",
          type: "checkbox",
          value: false
        }
      ]
    };
  }
};
</script>

<style></style>
