
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/dependencies', component: () => import('pages/Dependencies.vue') },
      { path: '/sites', component: () => import('pages/Sites') },
      { path: '/routers', component: () => import('pages/Routers')},
      { path: '/links', component: () => import('pages/Links')}
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
