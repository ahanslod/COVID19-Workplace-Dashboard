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
      this.$axios.post("http://localhost:3000/api/employees", this.values);
      alert("Employee has been added to the database");
    }
  },
  async mounted() {
    this.employeeIds = await this.$employeeIds();
  },
  data() {
    return {
      employeeIds: [],
      extra: {
        employeeId: null,
        phoneNumber: null
      },
      fields: [
        {
          label: "Department Name",
          id: "departmentName",
          value: null,
          invalidMessage: `Invalid Department name!`,
          valid() {
            return [
              "HR",
              "IT",
              "Marketing",
              "Production",
              "R&D",
              "Trippledex",
              "Sales",
              "Accounting",
              "Support",
              "Inventory"
            ].includes(this.value);
          }
        },
        {
          label: "First Name",
          id: "firstName",
          value: null,
          max: 50
        },
        {
          label: "Last Name",
          id: "lastName",
          value: null,
          max: 50
        },
        {
          label: "Date of Birth",
          id: "dateOfBirth",
          value: null,
          type: "date"
        },
        {
          label: "Sex",
          id: "sex",
          value: null,
          valid() {
            return ["M", "F"].includes(this.value);
          }
        },
        {
          label: "Height",
          id: "height",
          value: null,
          min: 25,
          max: 300,
          valid() {
            return this.value > 25 && this.value <= 300;
          }
        },
        {
          label: "Street Number",
          id: "streetNumber",
          value: null,
          type: "number"
        },
        {
          label: "Street Name",
          id: "streetName",
          value: null,
          max: 50
        },
        {
          label: "City",
          id: "city",
          value: null,
          max: 50
        },
        {
          label: "Province",
          id: "province",
          value: null,
          max: 2,
          valid() {
            return this.value.length === 2;
          }
        },
        {
          label: "Postal Code",
          id: "postalCode",
          value: null,
          max: 6,
          valid() {
            return this.value.length === 6;
          }
        },
        {
          label: "E-Mail Address",
          id: "emailAddress",
          value: null,
          invalidMessage: "Invalid email provided",
          valid() {
            return this.value.match(
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
            );
          }
        }
      ]
    };
  }
};
</script>

<style></style>
