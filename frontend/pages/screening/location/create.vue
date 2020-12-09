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
        :class="[
          'appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500',
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
        "http://localhost:3000/api/reports/location",
        this.values
      );
      alert("Created new location tracer report");
    }
  },
  data() {
    return {
      employeeIds: [16],
      fields: [
        {
          label: "Employee ID",
          id: "employeeId",
          value: null,
          self: this,
          valid() {
            return this.self.employeeIds.includes(Number(this.value));
          }
        },
        {
          label: "Date of Report",
          id: "dateOfReport",
          value: null,
          type: "date",
          value: new Date().toJSON().split("T")[0]
        },
        {
          label: "Time of entry",
          id: "timeOfEntry",
          value: null,
          type: "time"
        },
        {
          label: "Time of departure",
          id: "timeOfDeparture",
          value: null,
          type: "time"
        },
        {
          label: "Room number",
          id: "roomNumber",
          value: null,
          type: "number",
          valid() {
            return this.value >= 1 && this.value <= 25;
          }
        }
      ]
    };
  }
};
</script>

<style></style>
