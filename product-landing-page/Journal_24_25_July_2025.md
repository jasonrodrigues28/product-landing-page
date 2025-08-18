# Development Journal (Initial Days)

## 24 July 2025

### Work Summary / Tasks Done Today
Focused on establishing the Seller Dashboard scaffold and drafting the very first version of `productStore.js` to define a persistent product data backbone before integrating UI complexities.

Key activities:
- Created SellerDashboard structural shell (layout region + placeholder for future product table and add button).
- Drafted initial product data model fields: `productId`, `name`, `description`, `category`, `originalPrice`, `finalPrice` (placeholder), `hasDiscount`, `discountPercent`, `colorVariants`, `imagePaths`, `stock`, `createdAt`, `updatedAt`.
- Implemented rough Pinia store (`productStore.js`): state with `sellerInitials`, `productList`, `currentProductId`; simple `addProduct`, placeholder `updateProduct`, `deleteProduct` methods.
- Added initial (commented) plan for future enhancements: reusable ID gaps via `availableIds`, per‑color stock, discount centralization, units sold tracking, localStorage persistence.
- Decided to postpone discount and variant logic implementation to keep early iteration velocity high.
- Prepared notes for externalizing table column labels & icons into JSON config later.

### Challenges Faced
- Preventing feature creep (kept store minimal; deferred variants & discount math centralization).
- Choosing ID strategy (documented both pure increment vs gap reuse; left naive incremental version in code with TODO).
- Predicting future product shape changes (added explicit comment block with planned fields to reduce later merge friction).
- Deciding timing of persistence (stubbed persistence hooks; full error handling deferred).
- Avoiding coupling UI state (selection / dialog flags) into the domain store.

### Code Snippets
State (initial minimal concept – excerpt):
```javascript
export const useProductStore = defineStore('product', {
	state: () => ({
		sellerInitials: 'SUY',
		productList: [],
		currentProductId: 1,
		// planned: availableIds (Set) for ID reuse, stockByColor, unitsSoldByColor
	}),
	actions: {
		addProduct(product) {
			const id = `${this.sellerInitials}-${this.currentProductId}`;
			this.currentProductId += 1;
			this.productList.push({ ...product, productId: id, createdAt: new Date().toISOString() });
		},
		updateProduct(/* productId, updated */) { /* TODO */ },
		deleteProduct(/* productId */) { /* TODO */ }
	}
});
```

Planned ID reuse comment (recorded in early TODOs):
```text
// FUTURE: maintain availableIds = Set<number>; when deleting push numeric chunk;
// on add: if availableIds.size > 0 reuse lowest; else increment currentProductId.
```

SellerDashboard scaffold (placeholder region excerpt):
```vue
<template>
	<q-page padding>
		<div class="row items-center q-mb-md">
			<div class="text-h5">Seller Dashboard</div>
			<q-btn class="q-ml-auto" color="primary" label="Add Product" @click="showAdd = true" />
		</div>
		<!-- Future: ProductTable goes here -->
		<AddProduct v-if="showAdd" @close="showAdd=false" />
	</q-page>
</template>
```

### If AI Used (Prompts)
(Record actual prompts used or mark hypothetical.)
- "Draft a minimal Pinia product store for Vue 3 with autoincrement product IDs." 
- "Outline future enhancements for a product store (variants, discount, persistence)."
- "What fields should an initial e‑commerce product model include?"

---

## 25 July 2025

### Work Summary / Tasks Done Today
Implemented the first functional Add Product form component (standalone test harness) focusing on validation, discount logic, variant image handling, and preparing clean data handoff to the store.

Key accomplishments:
1. Structured form fields: Name, Description, Category, Original Price, Discount Toggle + % (conditional), Color Variants (multi‑select), per‑color image uploaders, computed Final Price (readonly).
2. Validation: Required text fields, price > 0, discount % between 0–100 only if discount enabled, at least one color when variants used, placeholder for enforcing per‑color image presence on submit.
3. Real‑time pricing: `calculateFinalPrice()` recalculates finalPrice on changes to price, discountPercent, or toggle state (fallback to original price if inactive/invalid).
4. Image workflow: Per‑color uploader loop; checks file size (<5MB) & MIME (JPG/PNG/WebP); converts to base64 for preview & later persistence; safe filename with timestamp; error notifications for size/type failure.
5. Variant-driven dynamic UI: Adding/removing colors updates uploader set reactively; stubbed future per‑color stock input region (not yet active).
6. Submission orchestration: `handleSubmit()` runs form rule validation + manual guards, normalizes discount fields, aggregates `imagePaths`, builds `productData` object (productId intentionally blank—store to generate later).
7. Utility extraction: `fileToBase64()` promise helper; created (unused) `resizeImage()` stub for planned optimization; consistent error handling around FileReader.
8. Notifications & UX: Positive/negative Quasar toasts; loading overlay guarded with try/catch in case plugin not mounted.
9. Temporary test harness page used to log the submission payload for structural verification pre-integration.
10. Documentation & forward planning: Comments marking future centralization of discount logic in store & introduction of per-color stock and unitsSold fields.

### Challenges Faced
- Deciding not to expose predicted productId yet to keep component decoupled from store internals.
- Preventing duplicated validation messages (balanced Quasar field rules vs final submission guard clauses).
- Managing rapid variant add/remove cycles potentially orphaning image data (added basic cleanup; flagged deeper check later).
- Balancing simplicity vs performance (kept full base64; deferred compression until real performance signal appears).
- Ensuring discount recalculation consistency without moving logic prematurely into store.

### Code Snippets
`data()` product skeleton + reactive stock map:
```javascript
data() {
	return {
		product: {
			productId: '', name: '', description: '', category: '',
			hasDiscount: false, discountPercent: 0,
			originalPrice: 0, finalPrice: 0,
			colorVariants: [], images: {}, stock: 50, unitsSold: 0
		},
		stockByColor: {},
		categories: ['Shirt','Tshirt','Pants'],
		colors: ['Red','Green','Blue']
	};
}
```

Final price calculation:
```javascript
calculateFinalPrice() {
	const { originalPrice, discountPercent, hasDiscount } = this.product;
	if (!hasDiscount || discountPercent <= 0) {
		this.product.finalPrice = originalPrice;
		return;
	}
	this.product.finalPrice = Math.round(originalPrice - (originalPrice * discountPercent)/100);
}
```

Image upload (validation + base64):
```javascript
async handleImageUpload(color, files) {
	if (!files || !files[0]) return;
	const file = files[0];
	if (file.size > 5 * 1024 * 1024) { /* notify too large */ return; }
	const valid = ['image/jpeg','image/png','image/webp'];
	if (!valid.includes(file.type)) { /* notify invalid type */ return; }
	this.$q.loading.show({ message: `Processing ${color} image...` });
	const safeName = `${this.product.productId}-${color.toLowerCase()}-${Date.now()}${this.getFileExtension(file.name)}`;
	const base64 = await this.fileToBase64(file);
	this.product.images[color] = { file, name: safeName, originalName: file.name, preview: base64 };
	if (this.isEdit) {
		this.product.imagePaths = this.product.imagePaths || {};
		this.product.imagePaths[color] = base64;
	}
	this.$q.loading.hide();
	this.$q.notify({ type: 'positive', message: `Image for ${color} uploaded successfully` });
}
```

Portion of handleSubmit building productData with imagePaths:
```javascript
const productData = {
	productId: this.product.productId,
	name: this.product.name,
	description: this.product.description,
	category: this.product.category,
	hasDiscount: this.product.hasDiscount,
	discountPercent: this.product.hasDiscount ? this.product.discountPercent : 0,
	originalPrice: this.product.originalPrice,
	finalPrice: this.product.finalPrice,
	colorVariants: [...this.product.colorVariants],
	imagePaths: {},
	stock: this.product.colorVariants.length === 0 ? this.product.stock : undefined,
	stockByColor: this.product.colorVariants.length > 0 ? { ...this.stockByColor } : undefined
};
for (const color of this.product.colorVariants) {
	const img = this.product.images[color];
	if (img?.preview) {
		productData.imagePaths[color] = img.preview;
	} else if (this.isEdit && this.editProduct?.imagePaths?.[color]) {
		productData.imagePaths[color] = this.editProduct.imagePaths[color];
	}
}
```

Variant color uploader loop (template excerpt):
```vue
<div v-for="(color, index) in product.colorVariants" :key="index" class="q-mb-md">
	<q-uploader
		:label="'Upload Image for ' + color"
		:auto-upload="false"
		accept=".jpg, .jpeg, .png, .webp"
		@added="(files) => handleImageUpload(color, files)"
		@removed="() => handleImageRemove(color)"
	/>
	<div v-if="product.images[color]" class="text-caption q-mt-sm">Selected: {{ product.images[color].name }}</div>
</div>
```

Resize image stub (future optimization):
```javascript
async resizeImage(base64, maxWidth) {
	// TODO: downscale large images before storing to reduce memory usage
	return base64; // placeholder (current build keeps original)
}
```

### If AI Used (Prompts)
- "Create a Vue 3 + Quasar Add Product form with discount calculation and per-color image uploads." 
- "How to validate Quasar q-form including custom image requirements?" 
- "Implement base64 image handling with size/type validation in Vue 3." 
- "Pattern for computing final discounted price reactively." 
(Replace or prune with actual prompts you employed.)

### Notes / Reflections
- Keeping price logic local sped up iteration; later migration to store will unify consistency for bulk updates.
- Early stub (`resizeImage`) will reduce friction when optimizing payload size or adding server upload stage.
- ProductId omission in UI avoids UX confusion about reserved IDs if the user cancels.

---

## Conversion to DOCX
You can convert this Markdown file to DOCX locally (example command using Pandoc):

pandoc Journal_24_25_July_2025.md -o Journal_24_25_July_2025.docx

(Or paste into Word/Google Docs and export.)

---

## 26 July 2025

### Work Summary / Tasks Done Today
Primary focus: initial implementation of the Product Table component (`ProductTable.vue`) to visualize stored products and prepare for future inline interactions (edit, delete, stock management). Even though advanced features (per‑color stock, inline quantity) were deferred, a robust table skeleton was built with forward‑compatible structure.

Key accomplishments:
- Created `ProductTable.vue` using Quasar `<q-table>` with defined columns: Product ID, Name, Description, Discount?, Discount %, Original Price, Final Price (placeholder duplication), Created (timestamp), and Actions.
- Implemented configurable columns array to simplify future adjustments (mapped later to JSON config source).
- Added slot-based rendering to keep room for conditional future logic (e.g., showing computed vs original price, variant breakdown).
- Inserted row-key binding (`productId`) for stable identity and future selection / batch operations.
- Began shaping an actions column with placeholder buttons (edit/delete) – not yet wired to modals; used stub event handlers.
- Verified data flow from the rudimentary `productStore` by adding a temporary test product and confirming table refresh is reactive.
- Added initial filtering (basic `:filter` prop) and tested search performance on small dataset.

### Challenges Faced
- Column duplication regarding final vs original price (no discount logic centralized yet) – left TODO markers.
- Deciding whether to prefetch all derived values (finalPrice) inside store vs computing in table – resolved to compute earlier in Add form for now.
- Ensuring reactivity reliability when future edit/delete mutates array; confirmed by manually pushing test objects into store.
- Weighing early introduction of pagination or virtual scroll – deferred until data volume justifies.

### Code Snippets
Columns + table skeleton excerpt:
```vue
<q-table
	:rows="products"
	:columns="columns"
	row-key="productId"
	flat
	dense
>
	<template #body="props">
		<q-tr :props="props">
			<q-td key="productId">{{ props.row.productId }}</q-td>
			<q-td key="name">{{ props.row.name }}</q-td>
			<q-td key="description" class="ellipsis">{{ props.row.description }}</q-td>
			<q-td key="originalPrice">₹{{ props.row.originalPrice }}</q-td>
			<q-td key="finalPrice">₹{{ props.row.finalPrice }}</q-td>
			<q-td key="createdAt">{{ formatDate(props.row.createdAt) }}</q-td>
			<q-td key="actions">
				<q-btn dense flat icon="edit" color="primary" @click="edit(props.row)" />
				<q-btn dense flat icon="delete" color="negative" @click="markDelete(props.row)" />
			</q-td>
		</q-tr>
	</template>
</q-table>
```

Columns config (simplified):
```javascript
const columns = [
	{ name: 'productId', label: 'ID', field: 'productId' },
	{ name: 'name', label: 'Name', field: 'name', sortable: true },
	{ name: 'description', label: 'Description', field: 'description' },
	{ name: 'originalPrice', label: 'Original', field: 'originalPrice', sortable: true },
	{ name: 'finalPrice', label: 'Final', field: 'finalPrice' },
	{ name: 'createdAt', label: 'Created', field: 'createdAt' },
	{ name: 'actions', label: 'Actions' }
];
```

### If AI Used (Prompts)
- "Scaffold a Quasar q-table with custom body slot and actions column." 
- "What’s a clean column config pattern for a dynamic product table (Vue 3 + Quasar)?" 

### Notes / Reflections
- Establishing slot-based layout early will reduce friction when integrating inline stock editors and batch delete.
- Purposefully over-specified columns now to avoid structural churn later.

---

## 27 July 2025

### Work Summary / Tasks Done Today
Integrated the Product Table with the existing `productStore` logic for live data flow and incremental feature expansions (basic edit/delete scaffolding). Focus shifted from static layout to interaction plumbing.

Key accomplishments:
- Connected table `rows` prop to a computed getter returning `productStore.productList` (reactive binding confirmed through test additions).
- Added preliminary delete handler logic (placeholder function marking which product would be removed – actual mutation deferred to later day for safety).
- Implemented sorting capability on name and original price columns (using `sortable: true`).
- Inserted formatting function stub for createdAt (set stage for human-readable timestamps).
- Validated that store mutations (manual push/splice in console) propagate instantly to UI.
- Documented future enhancements: batch selection mode, row highlighting, inline stock management region, discount badge alignment.

### Challenges Faced
- Avoiding premature complexity: resisted adding selection state or multi-delete logic today.
- Potential duplication finalPrice/originalPrice – acknowledged; planned consolidation after discount flow stabilizes.
- Date formatting choices (locale differences) – left flexible using `toLocaleString` in method stub.

### Code Snippets
Computed products binding:
```javascript
computed: {
	products() { return this.productStore.productList; }
}
```

Date formatting helper:
```javascript
methods: {
	formatDate(ts) { return ts ? new Date(ts).toLocaleString() : ''; }
}
```

Delete stub (early):
```javascript
methods: {
	markDelete(row) { console.log('Would delete', row.productId); }
}
```

### If AI Used (Prompts)
- "Connect a Quasar q-table to a Pinia store with reactive updates." 
- "How to add sortable columns in Quasar table?" 

### Notes / Reflections
- Clear separation maintained: store handles data, table handles presentation; will help when adding complex stock columns.

---

## 28 July 2025

### Work Summary / Tasks Done Today
Built the first version of the Edit Product component (`EditProduct.vue`) to enable modification of existing product entries from the seller’s perspective. Extended Add form concepts while preserving original creation timestamps.

Key accomplishments:
- Cloned Add Product layout but adapted initialization to pre-fill existing product fields (prop-driven). 
- Added safe data clone so editing doesn’t immediately mutate store object until save confirmed.
- Preservation logic: kept `createdAt` untouched; added updatedAt assignment on save.
- Maintained discount recalculation behavior using the same calculateFinalPrice pattern (DRY through reuse or inline duplication with TODO to abstract later).
- Ensured image editing path: set up ability to add/replace color-specific images while keeping existing base64 entries if not modified.
- Introduced `@save` and `@close` event emissions for parent (Product Table/Seller Dashboard) to orchestrate store update.
- Documented future variant change edge cases (e.g., removing a color variant – what to do with orphaned image and per-color stock later).

### Challenges Faced
- Determining minimal diff update vs full object replacement: chose full replacement strategy (store update merges or overwrites), flagged selective merge optimization.
- Avoiding accidental loss of imagePaths when user doesn’t re-upload – handled by conditionally preserving original map entries.
- Ensuring discount recalculation triggers when toggling discount off and back on (watchers mirrored Add form).

### Code Snippets
Clone on create (excerpt):
```javascript
created() {
	if (this.editProduct) {
		this.local = { ...this.editProduct, images: {} };
		this.imagePaths = { ...this.editProduct.imagePaths };
	}
}
```

Save emit (simplified):
```javascript
save() {
	const updated = { ...this.local, imagePaths: { ...this.imagePaths } };
	this.$emit('save', updated);
	this.$emit('close');
}
```

Image preservation idea:
```javascript
for (const c of this.local.colorVariants) {
	if (!newUploads[c] && original.imagePaths[c]) {
		merged.imagePaths[c] = original.imagePaths[c];
	}
}
```

### If AI Used (Prompts)
- "Adapt an Add Product form into an Edit modal with pre-filled fields (Vue 3 + Quasar)." 
- "Preserve existing base64 images unless re-uploaded—pattern?" 

### Notes / Reflections
- Full-object replace approach simplifies initial logic; performance acceptable at current product scale.

---

## 30 July 2025

### Work Summary / Tasks Done Today
Integrated Add and Edit flows directly into Seller Dashboard so user can create & modify products end-to-end. Added dialog state management & refresh cues.

Key accomplishments:
- Added Add Product trigger (button/fab) to Seller Dashboard to open modal.
- Embedded EditProduct component flow initiated from Product Table action button.
- Implemented event wiring: AddProduct on submit -> store.addProduct; EditProduct on save -> store.updateProduct.
- Introduced ephemeral UI state: `showAddDialog`, `editingProduct` references.
- Applied optimistic UI pattern (dialog closes immediately after store success, with toast confirmation).
- Confirmed localStorage persistence after add/edit (manually reloaded app to verify products remain).

### Challenges Faced
- Handling productId assignment invisibility: left UI ID blank until after addition (decision: OK for MVP).
- Avoiding duplicate modals: prevented simultaneous Add + Edit by guarding state transitions.
- Ensuring watchers in Edit component re-fire when switching between different products (forced key binding or state reset logic considered).

### Code Snippets
Dialog state + handlers:
```javascript
data(){ return { showAdd:false, editing:null }; }
```

Open add modal:
```vue
<q-btn label="Add Product" @click="showAdd=true" />
```

Handle add close:
```vue
<AddProduct v-if="showAdd" @close="showAdd=false" />
```

Edit button:
```vue
<q-btn icon="edit" @click="editing=row" />
<EditProduct v-if="editing" :edit-product="editing" @save="onSave" @close="editing=null" />
```

### If AI Used (Prompts)
- "Manage multiple modal dialogs in Vue 3 without state collisions." 
- "Pattern for emitting save/close events from nested components (Quasar)." 

### Notes / Reflections
- Integration milestone: full CRUD path (minus delete) now supported.

---

## 31 July 2025

### Work Summary / Tasks Done Today
Focused on quality tightening: implemented delete functionality (single & groundwork for future batch), addressed early flaws (image persistence, discount recalculation quirks), and refined localStorage resilience.

Key accomplishments:
- Added `deleteProduct(productId)` invocation path from Product Table action (confirmation flow stubbed or inline for MVP).
- Introduced ID reuse concept concretely: added Set (`availableIds`) logic in store (foundation for recycling numeric suffixes of deleted products).
- Ensured localStorage serialization handles Set -> Array transformation.
- Fixed discount toggle issue (finalPrice not updating when disabling discount) by forcing recalc branch.
- Hardened image path retention on edit when no new uploads.
- Added notifications for deletion success and updated state counters (`currentProductId` adjusted when reusing IDs).

### Challenges Faced
- Guaranteeing ID consistency after deletion + addition cycles (validated: reused lowest available numeric ID).
- Keeping logic clear between `highestUsedId` vs `currentProductId` to avoid drift.
- Avoiding stale image references when product variants removed – partial cleanup added; flagged for follow-up.

### Code Snippets
ID reuse in addProduct (final form excerpt):
```javascript
if (this.availableIds.size > 0) {
	nextId = Math.min(...Array.from(this.availableIds));
	this.availableIds.delete(nextId);
} else {
	nextId = this.currentProductId;
	this.currentProductId = nextId + 1;
}
```

deleteProduct adds ID back:
```javascript
const numericId = parseInt(productId.split('-')[1]);
this.availableIds.add(numericId);
this.productList.splice(index,1);
```

Persist Set → Array:
```javascript
saveToLocalStorage() {
	localStorage.setItem('productStore', JSON.stringify({
		...this.$state,
		availableIds: Array.from(this.availableIds)
	}));
}
```

### If AI Used (Prompts)
- "Implement reusable numeric ID recycling in a Pinia store." 
- "Serialize a Set for localStorage and restore it safely." 

### Notes / Reflections
- Reuse strategy will keep IDs compact; documented trade-off (historical audit trail harder).

---

## 1 August 2025

### Work Summary / Tasks Done Today
Integrated Seller flow into the broader application shell (routing). Established navigation path and ensured error fallback route coverage.

Key accomplishments:
- Added route definitions for Seller Dashboard (and related pages) inside router config.
- Ensured lazy or direct component import (depending on chosen pattern) and verified hot reload still functional.
- Implemented navigation link(s) in main layout or menu.
- Confirmed 404 route still catches unknown paths.
- Tested direct deep-link (refresh on seller dashboard) to ensure state reload from localStorage works.

### Challenges Faced
- Ensuring store rehydration does not race with component mount; used synchronous localStorage load in state function.
- Handling potential missing localStorage (first load) gracefully.

### Code Snippets
Route entry:
```javascript
{ path: '/seller', name: 'seller', component: () => import('../pages/SellerDashboard.vue') }
```

Navigation link:
```vue
<q-item to="/seller" clickable><q-item-section>Seller Dashboard</q-item-section></q-item>
```

### If AI Used (Prompts)
- "Add a new route to a Vue 3 + Quasar project with Pinia state persistence considerations." 

### Notes / Reflections
- Routing integration unblocked future buyer side inclusion.

---

## 2 August 2025

### Work Summary / Tasks Done Today
Initial creation of `ProductQuantity.vue` component concept (skeleton) – targeted abstraction to unify seller stock adjustment and buyer quantity selection behaviors (design-first day; functionality partial).

Key accomplishments:
- Established component API draft: props (`productId`, `initialStock`, `isSeller`, `selectedColor`), events (`stock-updated`, future `added-to-cart`).
- Rendered numeric input + increment/decrement controls (UI skeleton) without final logic.
- Added conditional branches: seller view (edit stock value) vs buyer view (choose purchase quantity up to stock limit).
- Wrote TODO annotations for input validation, min/max enforcement, and integration glue to store/cart.
- Ensured destructuring-ready design for color-specific stock semantics.

### Challenges Faced
- Balancing a single component vs two specialized ones – chose unified approach to reduce duplication.
- Avoiding premature coupling to cart logic (kept emits generic).

### Code Snippets
Initial props concept:
```javascript
props:{ productId:String, initialStock:Number, isSeller:Boolean, selectedColor:String }
```

Dual mode template idea (simplified):
```vue
<div v-if="isSeller">
	<q-input v-model.number="stock" label="Stock" />
</div>
<div v-else>
	<q-btn icon="remove" @click="updateQuantity(-1)" />
	<span>{{ quantity }}</span>
	<q-btn icon="add" @click="updateQuantity(1)" />
</div>
```

Event emits placeholder:
```javascript
this.$emit('stock-updated', this.productId, stock, this.selectedColor);
this.$emit('added-to-cart', quantity);
```

### If AI Used (Prompts)
- "Design a dual-mode quantity component (seller edit vs buyer select) Vue 3." 

### Notes / Reflections
- Early clarity on interface will simplify later integration into table and buyer dashboard.

---

## 3 August 2025

### Work Summary / Tasks Done Today
Implemented core logic inside `ProductQuantity.vue`: stock validation, increment/decrement behavior, and event emission semantics.

Key accomplishments:
- Added internal reactive `currentQuantity/stock` state depending on role.
- Implemented safe guards: not allowing negative stock (seller) or quantity above available stock (buyer).
- Emitted `stock-updated(productId, newStock, selectedColor)` when seller value changes.
- Emitted `added-to-cart(quantity)` for buyer flow (placeholder – real add cart integration planned later).
- Provided immediate visual feedback (disabled + boundary enforcement) on reaching limits.
- Added basic accessibility attributes (aria-label hints planned for refinement later).

### Challenges Faced
- Distinguishing semantics: seller modifying authoritative stock vs buyer specifying order quantity; resolved by separate event names.
- Handling color variant context gracefully – used `selectedColor` pass-through without internal assumptions.

### Code Snippets
Increment / decrement (refined later but core logic):
```javascript
updateQuantity(delta){
	const next = this.quantity + delta;
	if (next >=1 && next <= this.stock) this.quantity = next;
}
```

Stock update emit guard:
```javascript
updateStock(newStock){
	if (newStock >= this.unitsSold){
		store.updateProductStock(this.productId, newStock, this.selectedColor);
		this.$emit('stock-updated', this.productId, newStock, this.selectedColor);
	}
}
```

### If AI Used (Prompts)
- "Implement increment/decrement with max boundary in Vue component." 

### Notes / Reflections
- Component now functionally ready for integration attempts with table and (later) buyer view.

---

## 4 August 2025

### Work Summary / Tasks Done Today
First attempt at integrating `ProductQuantity` into Product Table (seller mode) and Add/Edit forms (prepping for color-specific stock). Integration incomplete – encountered reactivity and data mismatch obstacles.

Key accomplishments:
- Injected `ProductQuantity` placeholder into Product Table stock column area (not yet bound to store update logic fully).
- Began refactoring AddProduct to consider per-color stock fields (draft `stockByColor` map introduced but not saved correctly through store add).
- Added store TODO for migrating from singular `stock` to color-based structure.

### Challenges Faced
- Loss of user-entered per-color stocks on submission (store rebuild overwriting map) – root cause: store add logic reconstructing stockByColor ignoring payload.
- Emission wiring complexity: product table row-level component needed to pass color context; not fully implemented.
- Risk of mixing responsibilities: AddProduct now juggling images + stock variations simultaneously – complexity spike.

### Code Snippets
Early (buggy) addProduct stock init (later fixed):
```javascript
if (product.colorVariants?.length) {
	product.colorVariants.forEach(c => stockByColor[c] = product.stock || 50);
}
// PROBLEM: ignored provided stockByColor payload
```

Watcher rebuilding stock map (AddProduct):
```javascript
'product.colorVariants': {
	handler(colors){
		const next={}; colors.forEach(c=> next[c]= this.stockByColor[c]||50);
		this.stockByColor = next;
	}
}
```

### If AI Used (Prompts)
- "Integrate a per-row child component emitting stock updates into a parent table (Vue 3 + Quasar)." 

### Notes / Reflections
- Identified need to adjust store to respect incoming stockByColor when provided.

---

## 5 August 2025

### Work Summary / Tasks Done Today
Second integration iteration focusing on resolving structural misunderstandings from previous day. Still not fully successful; solidified clearer contract for store and component interaction.

Key accomplishments:
- Explicitly defined expected payload contract: if `colorVariants.length > 0` and `stockByColor` present, store should trust provided map.
- Added debug logs around addProduct path to trace stock map loss.
- Drafted alternative approach: post-add mutation to patch stockByColor until add logic refactored.
- Began enumerating event payload shape for future `updateProductStock` action usage.

### Challenges Faced
- Avoiding partial success illusions (some colors updated, others not) – deferred shipping until consistent.
- Race between AddProduct resetting form and store reading stale references.

### Code Snippets
Proposed (then adopted) acceptance of provided map:
```javascript
const incoming = product.stockByColor;
if (incoming && Object.keys(incoming).length) {
	stockByColor = { ...incoming }; // trust caller
} else {
	// fallback build
}
```

Debug trace example:
```javascript
console.log('ADD incoming stockByColor', product.stockByColor);
console.log('ADD stored stockByColor', stockByColor);
```

### If AI Used (Prompts)
- "Why might a nested object in a Vue reactive payload be overwritten in a Pinia add action?" 

### Notes / Reflections
- Decision made: refactor store to trust provided map before moving forward.

---

## 6 August 2025

### Work Summary / Tasks Done Today
Breakthrough: successful integration of `ProductQuantity` for seller stock editing within Product Table and corrected store logic for preserving incoming `stockByColor` on add.

Key accomplishments:
- Modified addProduct logic to preserve provided stockByColor if present (instead of recalculating).
- Inserted ProductQuantity in table conditionally: for each color variant, separate component instance passing color context.
- Implemented `updateProductStock(productId, newStock, color)` store action usage on emitted `stock-updated` event.
- Added row visual spacing adjustments for stacked variant controls.
- Ensured updatedAt refresh after stock edits.

### Challenges Faced
- Guaranteeing atomic stock update (no race when multiple rapid edits) – acceptable for MVP in single-user environment.
- Handling variant removal scenario (orphaned stock entries) – left future cleanup note.

### Code Snippets
Final addProduct (excerpt now preserving map):
```javascript
const stockByColor = {};
if (product.colorVariants?.length) {
	if (product.stockByColor) {
		Object.assign(stockByColor, product.stockByColor);
	} else {
		product.colorVariants.forEach(c => stockByColor[c] = product.stock || 50);
	}
}
```

Table loop with ProductQuantity (seller mode excerpt):
```vue
<div v-if="row.colorVariants?.length" class="column">
	<div v-for="c in row.colorVariants" :key="c" class="q-mb-xs">
		<ProductQuantity :product-id="row.productId" :is-seller="true" :selected-color="c" />
	</div>
</div>
```

Stock updated handler pattern:
```javascript
onStockUpdated(id, newStock, color){ /* optional notify */ }
```

### If AI Used (Prompts)
- "Update nested color-specific stock in Pinia while keeping reactivity." 

### Notes / Reflections
- Foundation laid for buyer-side adoption of same component.

---

## 7 August 2025

### Work Summary / Tasks Done Today
Refined the previous day’s integration: validation polish, UI consistency, and added notification feedback for stock edits.

Key accomplishments:
- Added Quasar notify on successful stock update and on invalid (negative) correction auto-clamping to zero.
- Harmonized styling of stock column (padding, min width) for readability.
- Abstracted a small utility inside ProductQuantity to format numbers / enforce min.
- Ensured editing one color doesn’t re-render all rows unnecessarily (used key scoping and limited reactive dependencies).

### Challenges Faced
- Avoiding excessive notifications during rapid +/- clicking – throttling idea documented (deferred).
- Handling edge when seller enters non-numeric – used number input + guard fallback.

### Code Snippets
Clamp & notify (concept):
```javascript
if (newStock < unitsSold) { newStock = unitsSold; this.$q.notify({ type:'warning', message:'Cannot go below units sold' }); }
```

Progress bar color logic (already in component):
```javascript
progressColor(){ return this.stock===0? 'negative': this.stock<=5? 'warning':'positive'; }
```

### If AI Used (Prompts)
- "Throttle notifications in Vue for rapid repeated events." (research, not fully applied) 

### Notes / Reflections
- UX smoother; paved way for buyer integration.

---

## 8 August 2025

### Work Summary / Tasks Done Today
Finalized AddProduct + ProductTable synergy: now newly added products with variants immediately render per-color stock editors preserving initial values.

Key accomplishments:
- Synchronized AddProduct form result: ensured stockByColor flows intact (no overwrites) & variant order stable.
- Added fallback distribution logic only when legacy `stock` provided without a map.
- Implemented a watch in AddProduct resetting stockByColor for new colors while preserving existing values.
- Added final price consistency check after edit save.

### Challenges Faced
- Edge when variant list shrinks: removed colors’ stock leftovers— cleaned by reconstructing map from current variant list.
- Ensuring imagePaths mapping unaffected by stock operations – validated separation.

### Code Snippets
Distribution fallback (legacy single stock → per-color):
```javascript
const stockPer = Math.floor(original.stock / product.colorVariants.length);
product.colorVariants.forEach(c => stockByColor[c] = stockPer);
```

Variant change watcher (final form excerpt):
```javascript
'product.colorVariants': {
	handler(newColors){
		const next={}; newColors.forEach(c=> next[c]= this.stockByColor[c] ?? 50); this.stockByColor = next;
	}
}
```

### If AI Used (Prompts)
- "Preserve existing entries while rebuilding a reactive object on key list change (Vue)." 

### Notes / Reflections
- Core seller lifecycle (add → edit → adjust stock) considered stable.

---

## 9 August 2025

### Work Summary / Tasks Done Today
First attempt to integrate buyer-facing dashboard (BuyerDashboard) with variant selection and quantity component – initial effort unsuccessful (logic & data coupling issues).

Key accomplishments:
- Created BuyerDashboard scaffold with product listing cards (image, name, pricing, description).
- Introduced variant toggle (q-btn-toggle) concept for selecting active color.
- Embedded ProductQuantity (buyer mode) placeholder below each product card.
- Drafted `handleAddToCart` logic (not fully functional; cart store not complete / misaligned shape).

### Challenges Faced
- Mismatch between ProductQuantity emitted event and expected cart payload shape.
- Image selection race: selected color changed before imagePaths ready in some cases.
- No central cart store yet → attempted direct array approach, abandoned for proper store plan.

### Code Snippets
Variant toggle (BuyerDashboard excerpt):
```vue
<q-btn-toggle v-model="selectedColors[product.productId]" :options="product.colorVariants.map(c=>({label:c,value:c}))" @update:model-value="onColorChange(product)" />
```

Early (incomplete) add to cart stub:
```javascript
handleAddToCart(p, qty, color){ /* TODO implement cart merge */ }
```

### If AI Used (Prompts)
- "Pattern for variant toggle + dynamic image swap (Vue + Quasar)." 

### Notes / Reflections
- Documented corrections for tomorrow: build dedicated cart store first, then wire add.

---

## 10 August 2025

### Work Summary / Tasks Done Today
Successful buyer dashboard integration including functional add-to-cart flow and variant-aware price display.

Key accomplishments:
- Implemented `cart.js` Pinia store with items array, merging logic (same productId + color increments quantity), totalPrice getter.
- Completed handleAddToCart: validates stock availability (variant-specific) before pushing to cart store.
- Added discount presentation: original price struck-through & final price emphasized with SALE chip.
- Wired color toggle to re-render ProductQuantity by key strategy.
- Validated integration with variant images changing dynamically on color selection.

### Challenges Faced
- Ensuring re-render only when color or productId changes (used composite key `${productId}-${selectedColor}` to force refresh without over-rendering others).
- Avoiding duplicate cart items (ensured merge logic checks selectedColor).
- Handling missing imagePaths gracefully.

### Code Snippets
Cart store merge (concept):
```javascript
addToCart(item){
	const existing = this.items.find(i => i.productId===item.productId && i.selectedColor===item.selectedColor);
	if (existing) existing.quantity += item.quantity; else this.items.push(item);
}
```

Buyer embed forcing key:
```vue
<ProductQuantity :key="product.productId + '-' + selectedColors[product.productId]" ... />
```

Final handleAddToCart (simplified):
```javascript
handleAddToCart(product, qty, color){
	if (color && product.stockByColor?.[color] < qty) return;
	cart.addToCart({ productId: product.productId, selectedColor: color, quantity: qty, price: product.finalPrice });
}
```

### If AI Used (Prompts)
- "Merge cart items by composite key (product + variant) in Pinia." 

### Notes / Reflections
- Buyer flow baseline complete (pre-checkout).

---

## 11 August 2025

### Work Summary / Tasks Done Today
Focused on cart bug resolution and checkout integration with product stock mutation.

Key accomplishments:
- Added checkout method in product store to decrement stock / stockByColor and increment unitsSold / unitsSoldByColor.
- Fixed bug: cart items referencing `item.id` vs `productId` mismatch – standardized field naming (`id` -> productId mapping validated).
- Added pre-checkout validation to ensure adequate stock (catches stale additions after intervening seller edits).
- Implemented cart clear on successful checkout with confirmation notification.
- Ensured unitsSold aggregates recomputed off unitsSoldByColor for variant products.

### Challenges Faced
- Reconciling legacy single stock vs stockByColor during checkout – added branching logic.
- Ensuring cart removal restores stock only when explicitly removed (not on checkout success).

### Code Snippets
Checkout loop (store excerpt):
```javascript
cartItems.forEach(item => {
	const product = this.productList.find(p => p.productId === item.id);
	if (!product) return;
	if (item.selectedColor) {
		if (product.stockByColor[item.selectedColor] >= item.quantity) {
			product.stockByColor[item.selectedColor] -= item.quantity;
			product.unitsSoldByColor[item.selectedColor] = (product.unitsSoldByColor[item.selectedColor]||0)+item.quantity;
			product.unitsSold = Object.values(product.unitsSoldByColor).reduce((a,b)=>a+b,0);
		}
	} else if (product.stock >= item.quantity) {
		product.stock -= item.quantity;
		product.unitsSold = (product.unitsSold||0)+item.quantity;
	}
});
```

Pre-checkout validation (CartPage concept):
```javascript
for (const item of cart.items) {
	const p = productStore.productList.find(x=>x.productId===item.productId);
	if (!p) throw new Error('Missing product');
	if (item.selectedColor) {
		if (p.stockByColor[item.selectedColor] < item.quantity) invalid.push(item);
	} else if (p.stock < item.quantity) invalid.push(item);
}
```

Clear cart after success:
```javascript
cart.clear();
```

### If AI Used (Prompts)
- "Implement checkout updating variant-specific stock and units sold in Pinia." 

### Notes / Reflections
- Data integrity between cart and stock validated through manual test scenarios.

---

## 12 August 2025

### Work Summary / Tasks Done Today
Final integration & polish pass: unified flows (Seller + Buyer + Cart), stabilized edge cases, and applied foundational UI styling.

Key accomplishments:
- Styled BuyerDashboard and Cart with dark gradient theme and elevated card effects for visual coherence.
- Added safe guards in AddProduct and handleAddToCart for null/undefined fields.
- Improved notification consistency (positions set to top, uniform success/error phrasing).
- Minor refactor: simplified repeated discount display logic across components.
- Verified localStorage persistence cycle: add → edit → stock change → checkout → reload.
- Created journal/documentation scaffolding (this log) to capture development chronology.

### Challenges Faced
- Memory consideration with multiple base64 images – noted future optimization (resize or offload to server) in TODOs.
- Managing growing complexity in productStore (potential candidate for modularization later: inventory, pricing, cart interactions separation).

### Code Snippets
Discount display (card excerpt):
```vue
<div v-if="p.hasDiscount" class="row items-center">
	<span class="text-negative text-bold q-mr-sm">₹{{ p.finalPrice }}</span>
	<span class="text-caption text-strike">₹{{ p.originalPrice }}</span>
	<q-chip color="negative" text-color="white" size="sm">-{{ p.discountPercent }}%</q-chip>
</div>
<div v-else>₹{{ p.originalPrice }}</div>
```

Typical notification call:
```javascript
this.$q.notify({ type:'positive', message:'Stock updated', position:'top' });
```

Product object excerpt after lifecycle:
```json
{
	"productId": "SUY-3",
	"name": "Variant Tee",
	"colorVariants": ["Red","Blue"],
	"stockByColor": { "Red": 18, "Blue": 7 },
	"unitsSoldByColor": { "Red": 5, "Blue": 3 },
	"unitsSold": 8,
	"finalPrice": 499,
	"originalPrice": 699
}
```

### If AI Used (Prompts)
- "Polish Quasar UI for product cards (dark theme)." 
- "Document a development timeline in structured journal format." 

### Notes / Reflections
- MVP feature set complete; next-phase targets: image optimization, server-side API, auth hardening, analytics metrics.

---

## Next Steps (Post-Journal Forward Look)
- Extract pricing & inventory logic into separate composables or mini-stores.
- Implement server sync layer (replace localStorage) with optimistic updates.
- Add pagination or virtual scroll for large product sets.
- Introduce role-based access control for seller vs buyer actions.
- Optimize image handling (resize/compress, lazy loading on BuyerDashboard).

