import React, { useState } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Widget from "./Widget";
import Chart from "./elements/charts/Chart";
import MyButton from "./elements/buttons/MyButton";
import TopBar from "./TopBar";
import MySwitch from "./elements/buttons/MySwitch";
import MyLabel from "./elements/labels/MyLabel";
import MySlider from "./elements/inputs/MySlider";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalItems = ["a", "b", "c", "d", "e"];

const componentList = {
  a: Chart,
  b: MyButton,
  c: MySwitch,
  d: MyLabel,
  e: MySlider
};

let count = 0;
const DropDrag = ({
  props,
  layout,
  setLayout,
  elements,
  setElements,
  deviceList,
  selectedDevice,
  handleUpdateLayout,
  handleChangeDevice,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);

  count++;
  // console.log("Aktualizacja DragDrop: ", count);

  const handleButtonClick = () => {
    if (isEditMode) {
      onLayoutSave();
    }
    setIsEditMode((prevEditMode) => !prevEditMode);
    setIsDraggable((prevDraggable) => !prevDraggable);
  };

  const onLayoutChange = (new_layout, layouts) => {
    if (isEditMode) {
      const updatedLayout = layout.map((originalLayoutItem) => {
        const newLayoutItem = new_layout.find(
          (item) => item.i === originalLayoutItem.element_id
        );
        if (newLayoutItem) {
          return {
            ...newLayoutItem,
            i: originalLayoutItem.i,
            element_id: originalLayoutItem.element_id,
          };
        }
        return originalLayoutItem;
      });
      setLayout(updatedLayout);
    }
  };

  const onLayoutSave = () => {
    handleUpdateLayout();
  };

  const onRemoveItem = (itemId) => {
    const updatedLayout = layout.filter((item) => item.element_id !== itemId);
    setLayout(updatedLayout);

    const updatedElements = elements.filter(
      (element) => element.element_id !== itemId
    );
    setElements(updatedElements);
  };

  const onUpdateSettings = (newSettings, id) => {
    const updatedElements = elements.map((element) => {
      if (element.element_id === id) {
        return newSettings;
      }
      return element;
    });

    setElements(updatedElements);
  };

  return (
    <>
      <TopBar
        layout={layout}
        setLayout={setLayout}
        elements={elements}
        setElements={setElements}
        originalItems={originalItems}
        isEditMode={isEditMode}
        handleButtonClick={handleButtonClick}
        deviceList={deviceList}
        selectedDevice={selectedDevice}
        handleChangeDevice={handleChangeDevice}
      />
      <div className="mb-4 layout">
        <ResponsiveReactGridLayout
          {...props}
          style={{ border: "1px solid #ccc", borderRadius: "4px" }}
          layout={layout}
          cols={{ lg: 24, md: 24, sm: 24, xs: 24, xxs: 24 }}
          rowHeight={30}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          measureBeforeMount={false}
          onLayoutChange={onLayoutChange}
          isDroppable={true}
          isDraggable={isDraggable}
          isResizable={isEditMode}
          compactType={null}
          preventCollision
        >
          {layout && layout.length > 0 ? (
            layout.map((item, index) => {
              return (
                <div key={item.element_id} data-grid={item}>
                  <Widget
                    id={item.element_id}
                    onRemoveItem={onRemoveItem}
                    component={componentList[item.i]}
                    element={elements.find(
                      (element) => element.element_id === item.element_id
                    )}
                    isEditMode={isEditMode}
                    setIsDraggable={setIsDraggable}
                    windowHeight={window.innerHeight}
                    selectedDevice={selectedDevice}
                    onUpdateSettings={onUpdateSettings}
                    setElements={setElements}
                    setLayout={setLayout}
                    layout={layout}
                    elements={elements}
                  />
                </div>
              );
            })
          ) : (
            <p>No items in layout</p>
          )}
        </ResponsiveReactGridLayout>
      </div>
    </>
  );
};

export default DropDrag;
