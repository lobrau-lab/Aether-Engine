import { describe, it, expect, mock, beforeEach } from 'bun:test';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextureAnd3DPipelineView } from '../TextureAnd3DPipelineView';
import { Asset } from '../../types';

// Mock the child components to simplify testing
mock.module('../BatchGenerationQueue', () => ({
  BatchGenerationQueue: () => <div data-testid="batch-queue-mock">Batch Queue Mock</div>
}));

describe('TextureAnd3DPipelineView', () => {
  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      name: 'Rusty Metal Material',
      type: 'texture',
      state: 'review_required',
      version: 1,
      provenance: {
        jobId: 'job-1',
        actor: 'user-1',
        timestamp: new Date().toISOString(),
        model: 'stable-diffusion-xl',
        version: '1.0',
        license: 'MIT',
        seed: 12345,
        machine: 'node-1',
        prompt: 'rusty metal plate, high quality, 4k, seamless',
        settings: {}
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versionHistory: []
    },
    {
      id: 'asset-2',
      name: 'Wooden Crate',
      type: 'mesh_3d',
      state: 'approved',
      version: 2,
      provenance: {
        jobId: 'job-2',
        actor: 'user-1',
        timestamp: new Date().toISOString(),
        model: 'shap-e',
        version: '1.0',
        license: 'MIT',
        seed: 54321,
        machine: 'node-1',
        prompt: 'wooden crate, low poly',
        settings: {}
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versionHistory: []
    }
  ];

  const mockOnGeneratePBR = mock().mockResolvedValue(undefined);
  const mockOnUpdateAssetState = mock();
  const mockOnRollbackAsset = mock();

  beforeEach(() => {
    mockOnGeneratePBR.mockClear();
    mockOnUpdateAssetState.mockClear();
    mockOnRollbackAsset.mockClear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <TextureAnd3DPipelineView
        assets={mockAssets}
        onGeneratePBR={mockOnGeneratePBR}
        onUpdateAssetState={mockOnUpdateAssetState}
        onRollbackAsset={mockOnRollbackAsset}
        {...props}
      />
    );
  };

  it('renders the component with assets', () => {
    renderComponent();

    // Check if header is rendered
    expect(screen.getByText('OFFLINE ASSET STUDIO')).toBeInTheDocument();

    // Check if assets are listed in the right column
    expect(screen.getByText('Rusty Metal Material')).toBeInTheDocument();
    expect(screen.getAllByText('Wooden Crate').length).toBeGreaterThan(0);
    expect(screen.getByText(/Studio Asset Pipeline/)).toBeInTheDocument();
  });

  it('handles tab switching', () => {
    renderComponent();

    // Default tab should be PBR Maps
    expect(screen.getAllByText('Albedo (Base Color)').length).toBeGreaterThan(0);

    // Switch to Topology Inspector tab
    const topologyTabs = screen.getAllByRole('button', { name: /3D Mesh Inspector/i });
    fireEvent.click(topologyTabs[0]); // Click the first matching tab

    // Check if topology content is rendered
    expect(screen.getByText('3D Mesh Quality & Retopology Engine')).toBeInTheDocument();
    expect(screen.getByText('Poly Count:')).toBeInTheDocument();

    // Switch to State Machine tab
    const stateMachineTabs = screen.getAllByRole('button', { name: /State Machine & QA/i });
    fireEvent.click(stateMachineTabs[0]);

    // Check if state machine content is rendered
    expect(screen.getByText('Asset State Machine Rules & QA Lifecycle')).toBeInTheDocument();
  });

  it('allows asset selection', () => {
    renderComponent();

    // Find all 'Wooden Crate' texts, we want the one in the asset list
    const crateElements = screen.getAllByText('Wooden Crate');
    const assetCard = crateElements.find(el => el.closest('.cursor-pointer')) || crateElements[0];

    // Click on the second asset
    fireEvent.click(assetCard);

    // Check if the second asset is now selected
    expect(assetCard.closest('.cursor-pointer')).toHaveClass('bg-[#111114]');
  });

  it('calls onGeneratePBR when generating new texture', async () => {
    renderComponent();

    // Type in the prompt input
    const input = screen.getAllByPlaceholderText(/Enter texture or material description\.\.\./i)[0];
    fireEvent.change(input, { target: { value: 'New test texture' } });

    // Wait for state updates
    await waitFor(() => {
        expect(input).toHaveValue('New test texture');
    });

    // Click the generate button by looking for the span with the text
    const generateBtnTextElements = screen.getAllByText('Generate PBR Maps');
    // find the one that is inside a button
    const generateBtnText = generateBtnTextElements.find(el => el.closest('button'));
    if (generateBtnText) {
        fireEvent.click(generateBtnText.closest('button')!);
    } else {
        // fallback
        const generateBtns = screen.getAllByRole('button');
        const theBtn = generateBtns.find(btn => btn.textContent?.includes('Generate PBR Maps'));
        if (theBtn) fireEvent.click(theBtn);
    }

    // Check if the mock was called with the right argument
    await waitFor(() => {
      expect(mockOnGeneratePBR).toHaveBeenCalledWith('New test texture');
    });
  });

  it('calls onUpdateAssetState when approving an asset', () => {
    renderComponent();

    // Find the approve button for the first asset (which is in review_required state)
    // We search for elements with text Approve Asset
    const approveBtnTexts = screen.getAllByText('Approve Asset');
    const theApproveBtn = approveBtnTexts.find(el => el.closest('button'))?.closest('button');

    if (theApproveBtn) {
        fireEvent.click(theApproveBtn);
    } else {
        const btns = screen.getAllByRole('button');
        const approveBtn = btns.find(b => b.textContent?.includes('Approve Asset'));
        if (approveBtn) fireEvent.click(approveBtn);
    }

    // Check if the mock was called
    expect(mockOnUpdateAssetState).toHaveBeenCalledWith('asset-1', 'approved');
  });

  it('calls onRollbackAsset when rolling back an asset', () => {
    renderComponent();

    // Find the rollback button for the first asset
    const rollbackBtnTexts = screen.getAllByText(/Rollback/i);
    const theRollbackBtn = rollbackBtnTexts.find(el => el.closest('button'))?.closest('button');

    if (theRollbackBtn) {
        fireEvent.click(theRollbackBtn);
    } else {
        const btns = screen.getAllByRole('button');
        const rollbackBtn = btns.find(b => b.textContent?.includes('Rollback'));
        if (rollbackBtn) fireEvent.click(rollbackBtn);
    }

    // Check if the mock was called
    expect(mockOnRollbackAsset).toHaveBeenCalledWith('asset-1');
  });

  it('updates LOD slider value', () => {
    renderComponent();

    // Switch to Topology Inspector tab
    const topologyTabs = screen.getAllByRole('button', { name: /3D Mesh Inspector/i });
    fireEvent.click(topologyTabs[0]);

    // Find the slider
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('100'); // Default value

    // Change slider value
    fireEvent.change(slider, { target: { value: '50' } });
    expect(slider).toHaveValue('50');

    // Check if the text updated (14280 * 0.5 = 7140)
    expect(screen.getByText(/50% \(7140 Tris\)/)).toBeInTheDocument();
  });
});
