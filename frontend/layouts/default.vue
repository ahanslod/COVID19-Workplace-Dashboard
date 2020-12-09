<template>
  <div>
    <nav
      class="font-sans flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 bg-white shadow sm:items-baseline w-full"
    >
      <div class="mb-2 sm:mb-0">
        <a class="text-2xl text-grey-darkest cursor-pointer" @click="$router.push('/')">Admin Dashboard</a>
      </div>
      <div class="pr-12">
        <template v-for="(button, i) in visibleButtons">
          <div
            v-if="button.dropdown"
            :key="i"
            class="dropdown inline-block relative"
          >
            <button
              class="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
            >
              <span>{{ button.label }}</span>
            </button>
            <ul class="dropdown-content absolute hidden text-gray-700 pt-1">
              <li :key="x" v-for="(option, x) in button.options">
                <a
                  class="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap cursor-pointer	"
                  @click="redirect(option.href)"
                  >{{ option.label }}</a
                >
              </li>
            </ul>
          </div>
          <a
            v-else
            :key="i"
            @click="redirect(button.href)"
            class="text-lg no-underline text-grey-darkest hover:text-blue-dark ml-2 cursor-pointer"
            >{{ button.label }}</a
          >
        </template>
      </div>
    </nav>
    <nuxt />
  </div>
</template>
<style>
.dropdown:hover > .dropdown-content {
  display: block;
}
</style>
<script>
export default {
  middleware: "auth",

  methods: {
    redirect(path) {
      if (path === "/logout") {
        this.$auth.logout();
        return;
      }
      this.$router.push({ path });
    }
  },
  computed: {
    visibleButtons() {
      return this.buttons.filter(
        button =>
          (button.visible ? button.visible() : true) &&
          (button.auth !== undefined ? this.$auth.loggedIn : true)
      );
    }
  },
  data() {
    return {
      buttons: [
        {
          label: "Employees",
          dropdown: true,
          auth: true,
          options: [
            {
              label: "View Employees",
              href: "/employee/"
            },
            {
              label: "View Recovered Employees",
              href: "/employee/recovered"
            },
            {
              label: "View Quarantined Employees",
              href: "/employee/quarantined"
            },
            {
              label: "New Employee",
              href: "/employee/create"
            },
            {
              label: "New Quarantined Employee",
              href: "/employee/create/quarantine"
            },
            {
              label: "Contact for Quarantined Employees",
              href: "/employee/contact"
            }
          ]
        },
        {
          label: "Reports",
          dropdown: true,
          auth: true,

          options: [
            { label: "New Screening", href: "/screening/create" },
            {
              label: "New Location Tracer",
              href: "/screening/location/create"
            },
            { label: "View Latest", href: "/screening" }
          ]
        },
        {
          label: "Login",
          href: "/login",
          visible: () => {
            return !this.$auth.loggedIn;
          }
        },
        {
          label: "Tracer",
          href: "/tracer",
          auth: true
        },
        {
          label: "Schedules",
          href: "/schedules",
          auth: true
        },
        {
          label: "Department",
          href: "/department",
          auth: true
        },
        {
          label: "Logout",
          href: "/logout",
          auth: true
        }
      ]
    };
  }
};
</script>
