import { RouteInfo } from './sidebar.metadata';
export const ROUTES: RouteInfo[] = [
  // Admin Modules

  {
    path: '',
    title: 'MAIN MENU',
    iconType: '',
    icon: '',
    class: '',
    groupTitle: true,
    badge: '',
    badgeClass: '',
    role: ['All'],
    submenu: [],
  },
  {
    path: '/mnf/dashboard',
    title: `Dashboard`,
    iconType: 'material-icons-outlined',
    icon: 'space_dashboard',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: []
  }, 
  {
    path: '/mnf/profile',
    title: `Profile`,
    iconType: 'material-icons-outlined',
    icon: 'person',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: []
  },    
  {
    path: '/mnf/brand',
    title: `Brand`,
    iconType: 'material-icons-outlined',
    icon: 'business',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: []
  },    
  {
    path: '/mnf/category',
    title: `Category`,
    iconType: 'material-icons-outlined',
    icon: 'view_timeline',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: []
  },    
  {
    path: '',
    title: `Distributor's Management`,
    iconType: 'material-icons-outlined',
    icon: 'group_add',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: [
      {
        path: '/mnf/new-distributor',
        title: 'Invite New Distributor',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/mnf/manage-distributor',
        title: 'View And Manage Distributors',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/mnf/bulk-upload',
        title: 'Bulk Invite',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/mnf/invite-status',
        title: 'Invite Status',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
    ],
  },
  {
    path: '',
    title: `Product Management`,
    iconType: 'material-icons-outlined',
    icon: 'space_dashboard',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: [
      {
        path: '/mnf/add-new-product',
        title: 'Add new Product',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: ['manufacture'],
        submenu: [],
      },
      {
        path: '/mnf/manage-product',
        title: 'View And Manage Product',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Order Management`,
    iconType: 'material-icons-outlined',
    icon: 'description',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'New Orders',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'View Order Status',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Returns  Management`,
    iconType: 'material-icons-outlined',
    icon: 'widgets',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'Order Return',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'Order Cancelled',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Other Services`,
    iconType: 'material-icons-outlined',
    icon: 'supervised_user_circle',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['manufacture'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'Logistics partners',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'Product Photo And Video Shoot',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },

  // -------------------------------------- retailer -------------------------------------//
  {
    path: '/retailer/dashboard',
    title: `Dashboard`,
    iconType: 'material-icons-outlined',
    icon: 'space_dashboard',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['retailer'],
    submenu: []
  }, 
  {
    path: '/retailer/profile',
    title: `Profile`,
    iconType: 'material-icons-outlined',
    icon: 'person',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['retailer'],
    submenu: []
  },  
  // {
  //   path: '',
  //   title: `Retailer's Management`,
  //   iconType: 'material-icons-outlined',
  //   icon: 'group_add',
  //   class: 'menu-toggle',
  //   groupTitle: false,
  //   badge: '',
  //   badgeClass: '',
  //   role: ['retailer'],
  //   submenu: [
  //     {
  //       path: '/retailer/new-retailer',
  //       title: 'Invite New Retailer',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //     {
  //       path: '/retailer/manage-retailer',
  //       title: 'View And Manage Retailer',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //     {
  //       path: '/retailer/bulk-upload',
  //       title: 'Bulk Invite',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //     {
  //       path: '/retailer/invite-status',
  //       title: 'Invite Status',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //   ],
  // },
  {
    path: '',
    title: `Product Management`,
    iconType: 'material-icons-outlined',
    icon: 'space_dashboard',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['retailer'],
    submenu: [
      {
        path: '/retailer/mnf-list',
        title: 'Manufacturer List',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'View And Manage Product',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Order Management`,
    iconType: 'material-icons-outlined',
    icon: 'description',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['retailer'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'New Orders',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'View Order Status',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Returns  Management`,
    iconType: 'material-icons-outlined',
    icon: 'widgets',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['retailer'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'Order Return',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'Order Cancelled',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Other Services`,
    iconType: 'material-icons-outlined',
    icon: 'supervised_user_circle',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['retailer'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'Logistics partners',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'Product Photo And Video Shoot',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  // -------------------------------------- wholesaler -------------------------------------//
  {
    path: '/wholesaler/dashboard',
    title: `Dashboard`,
    iconType: 'material-icons-outlined',
    icon: 'space_dashboard',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['wholesaler'],
    submenu: []
  }, 
  {
    path: '/wholesaler/profile',
    title: `Profile`,
    iconType: 'material-icons-outlined',
    icon: 'person',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['wholesaler'],
    submenu: []
  },  
  {
    path: '',
    title: `Retailer's Management`,
    iconType: 'material-icons-outlined',
    icon: 'group_add',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['wholesaler'],
    submenu: [
      {
        path: '/wholesaler/new-retailer',
        title: 'Invite New Retailer',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/wholesaler/manage-retailer',
        title: 'View And Manage Retailer',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/wholesaler/bulk-upload',
        title: 'Bulk Invite',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/wholesaler/invite-status',
        title: 'Invite Status',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
    ],
  },
  {
    path: '',
    title: `Product Management`,
    iconType: 'material-icons-outlined',
    icon: 'space_dashboard',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['wholesaler'],
    submenu: [
      {
        path: '/wholesaler/mnf-list',
        title: 'Manufacturer List',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/wholesaler/wishlist-product',
        title: 'View Wishlist Product',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
      {
        path: '/wholesaler/add-to-cart',
        title: 'Add To Cart Product',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Order Management`,
    iconType: 'material-icons-outlined',
    icon: 'description',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['wholesaler'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'New Orders',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'View Order Status',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Returns  Management`,
    iconType: 'material-icons-outlined',
    icon: 'widgets',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['wholesaler'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'Order Return',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'Order Cancelled',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  {
    path: '',
    title: `Other Services`,
    iconType: 'material-icons-outlined',
    icon: 'supervised_user_circle',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    role: ['wholesaler'],
    submenu: [
      {
        path: '/users/trainer',
        title: 'Logistics partners',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },
      {
        path: '/users/skill-trainer',
        title: 'Product Photo And Video Shoot',
        iconType: '',
        icon: '',
        class: 'ml-menu',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        role: [''],
        submenu: [],
      },      
    ],
  },
  // {
  //   path: '',
  //   title: 'User Management',
  //   iconType: 'material-icons-outlined',
  //   icon: 'group_add',
  //   class: 'menu-toggle',
  //   groupTitle: false,
  //   badge: '',
  //   badgeClass: '',
  //   role: ['cluster'],
  //   submenu: [
  //     {
  //       path: '/users/trainer',
  //       title: 'Career Counsellor',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //     {
  //       path: '/users/skill-trainer',
  //       title: 'Life Skill Trainer',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //   ],
  // },

  // ----------------------- Student Modules ---------------------

 
  // {
  //   path: '',
  //   title: 'User Management',
  //   iconType: 'material-icons-outlined',
  //   icon: 'group_add',
  //   class: 'menu-toggle',
  //   groupTitle: false,
  //   badge: '',
  //   badgeClass: '',
  //   role: ['superadmin'],
  //   submenu: [
      
  //     {
  //       path: '/users/cluster',
  //       title: 'Cluster Users',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [],
  //       submenu: [],
  //     },
  //     // {
  //     //   path: '/users/district',
  //     //   title: 'District Users',
  //     //   iconType: '',
  //     //   icon: '',
  //     //   class: 'ml-menu',
  //     //   groupTitle: false,
  //     //   badge: '',
  //     //   badgeClass: '',
  //     //   role: [''],
  //     //   submenu: [],
  //     // },
  //     {
  //       path: '/users/trainer',
  //       title: 'Career Counsellor',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //     {
  //       path: '/users/skill-trainer',
  //       title: 'Life Skill Trainer',
  //       iconType: '',
  //       icon: '',
  //       class: 'ml-menu',
  //       groupTitle: false,
  //       badge: '',
  //       badgeClass: '',
  //       role: [''],
  //       submenu: [],
  //     },
  //   ],
  // },
  
];
